import {Redis} from 'ioredis';
import 'dotenv/config';

let redis: Redis;

if(!process.env.REDIS_URL){
    throw new Error("REDIS_URL not found");
}
redis = new Redis(process.env.REDIS_URL);

export default redis;