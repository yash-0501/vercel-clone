import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import path from "path";
import { getAllFiles } from "./files";
import { uploadFile } from "./uploadFile";
// import { createClient } from "redis";
import { Redis } from "ioredis"
import dotenv from "dotenv";

dotenv.config();

const publisher = new Redis('rediss://default:'+process.env.redis_endpoint);
// publisher.connect(); // publisher for redis

const subscriber = new Redis('rediss://default:'+process.env.redis_endpoint);

const app = express();
app.use(cors());
app.use(express.json());


app.post("/deploy",async (req,res)=>{
    const repoUrl = req.body.repoUrl; // github url
    const id = generate();

    await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

    // array of all the file paths
    const files = getAllFiles(path.join(__dirname, `output/${id}`));

    console.log("Upload Started")
    
    // Put all the files to S3 -- when all the files are uploaded then only control goes to next statement
    await Promise.all(files.map(async file => {
        await uploadFile(file.slice(__dirname.length+1), file);
    }));
    
    console.log("Upload Ended")

    publisher.lpush("build-queue", id);
    publisher.hset("status", id, "uploaded");

    res.json({
        id: id
    })
})


app.get("/status", async(req, res) => {
    const id = req.query.id;
    const response = await subscriber.hget("status", id as string);
    res.json({
        status: response
    })
});


app.listen(3000);