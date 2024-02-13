import {S3} from "aws-sdk";
import fs from "fs";
import path, { resolve } from "path";
import dotenv from 'dotenv';
dotenv.config();

const s3 = new S3({
    accessKeyId: process.env.id,
    secretAccessKey: process.env.secret,
    endpoint: process.env.endpoint
})

export async function downloadS3Folder(prefix: string){
    console.log("Download initiated")
    console.log(prefix);
    
    const allFiles = await s3.listObjectsV2({
        Bucket: "vercel-clone",
        Prefix: prefix
    }).promise();

    // console.log("All files:", allFiles);
    // to make sure that until all the files are read, this function shouldn't return - promisified the map
    const allPromises = allFiles.Contents?.map(async ({Key}) =>{
        return new Promise( async (resolve) =>{
            if(!Key){
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);

            if(!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, {recursive: true});
            }

            s3.getObject({
                Bucket:"vercel-clone",
                Key: Key || ""
            }).createReadStream().pipe(outputFile)
            .on("finish", ()=>{
                resolve("");
            })

        })
    }) || []

    console.log("awaiting");

    await Promise.all(allPromises?.filter(x => x !== undefined));
    
}

export function copyFinalDist(id: string){
    const folderPath = path.join(__dirname, `output/${id}/dist`);
    const allFiles = getAllFiles(folderPath);
    allFiles.forEach(file =>{
        uploadFile(`dist/${id}/` + file.slice(folderPath.length+1), file);
    })
}

const getAllFiles = (folderPath: string) =>{
    let res: string[] = [];

    const allFIlesAndFolders = fs.readdirSync(folderPath);
    allFIlesAndFolders.forEach(file =>{
        if (file.startsWith(".") && file !== ".gitignore") {
            console.log("Skipping folder/file: ", file);
            return; // Skip this file/folder
        }
        const fullFilePath = path.join(folderPath, file);
        if(fs.statSync(fullFilePath).isDirectory()){
            res = res.concat(getAllFiles(fullFilePath));
        }else{
            res.push(fullFilePath);
        }
    })
    return res;
}

const uploadFile = async (fileName: string, localFilePath: string) =>{
    console.log("Uploading file: ", fileName);

    const fileContent = fs.readFileSync(localFilePath);
    let normalizedFileName = path.normalize(fileName)
    normalizedFileName = normalizedFileName.replace(/\\/g, '/');

    const res = await s3.upload({
        Body: fileContent,
        Bucket: "vercel-clone",
        Key: normalizedFileName
    }).promise();
    console.log("File Uploaded successfully");
    console.log(res);
}

