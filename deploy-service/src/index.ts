// import { createClient, commandOptions } from "redis";
import { Redis } from "ioredis";
import { copyFinalDist, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";
import dotenv from "dotenv";

dotenv.config();

const publisher = new Redis('rediss://default:'+process.env.redis_endpoint);
// publisher.connect(); // publisher for redis

const subscriber = new Redis('rediss://default:'+process.env.redis_endpoint);
// subscriber.connect(); // subscriber for redis

// publisher.lpush("build-queue", 'fudggcyi')

async function main(){
    while(1){
        const response = await subscriber.blpop(
            'build-queue',
            0
        );
        console.log(response);

        // @ts-ignore
        const id = response[1];

        await downloadS3Folder(`output/${id}/`);
        await buildProject(id)
        copyFinalDist(id);
        publisher.hset("status", id, "deployed");
    }
}

main();