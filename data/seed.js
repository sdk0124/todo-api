import mongoose from "mongoose";
import data from './mock.js';
import Task from '../models/Task.js';
import * as dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.DATABASE_URL);

await Task.deleteMany({}); // 모든 데이터 삭제
await Task.insertMany(data); // mock.js 데이터를 초기 데이터값으로 설정

mongoose.connection.close();