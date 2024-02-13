import {S3} from "aws-sdk";
import fs from "fs";
import path from "path";
import dotenv from 'dotenv';
dotenv.config();


const s3 = new S3({
    accessKeyId: process.env.id,
    secretAccessKey: process.env.secret,
    endpoint: process.env.endpoint
})

export const uploadFile = async (fileName: string, localFilePath: string) =>{
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

