import express from "express";
import { S3 } from "aws-sdk";
import dotenv from 'dotenv';

import mime from "mime-types";

dotenv.config();

const app = express();

const s3 = new S3({
    accessKeyId: process.env.id,
    secretAccessKey: process.env.secret,
    endpoint: process.env.endpoint
})

app.get("/*", async (req,res)=>{
    const host = req.hostname;

    const id = host.split(".")[0];
    console.log(id)

    let filePath = req.url;
    if(filePath === '/')
        filePath += 'index.html'
    console.log(filePath);

    const contents = await s3.getObject({
        Bucket: "vercel-clone",
        Key: `dist/${id}${filePath}`  
    }).promise();

    const type = mime.lookup(filePath);
    console.log(type)
    // @ts-ignore
    res.set("Content-Type", type);

    res.send(contents.Body);
    // res.send("Hello World");

})

app.listen(3001)