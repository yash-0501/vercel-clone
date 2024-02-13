import fs from "fs";
import path from "path";

export const getAllFiles = (folderPath: string) =>{
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