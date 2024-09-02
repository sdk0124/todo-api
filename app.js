import mongoose from 'mongoose';

import * as dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';

import express from 'express';
// import mockTasks from './data/mock.js';
import Task from './models/Task.js';

mongoose.connect(process.env.DATABASE_URL).then(() => console.log('Connected to DB'));

const app = express();

// 비동기 코드 오류를 처리하는 함수
function asyncHandler(handler) {
    return async function (req, res) {
        try {
            await handler(req, res);
        } catch (e) {
            if (e.name === 'ValidationError') {
                res.status(400).send({message : e.message});
            } else if (e.name === 'CastError') {
                res.status(404).send({message : 'Cannot find given id'});
            } else {
                res.status(500).send({message : e.message});
            }
        }
    }
}

app.use(cors()); // 프론트엔드 코드에서 API를 사용할 수 있게 해줌.
app.use(express.json()); // request로 받은 json 객체를 자바스크립트로 바꾸는 함수

// (url 경로, 처리할 함수)
app.get('/tasks', asyncHandler(async (req, res) => {
    /*
    * 쿼리 파라미터
    * - sort : 'oldest'인 경우 아주 오래된 task부터 보여준다. 나머지의 경우 최신순서로
    * - count : 전달할 task 개수
    */
    const sort = req.query.sort;
    const count = Number(req.query.count) || 0;

    const sortOption = { createdAt: sort === 'oldest' ? 'asc' : 'desc'};
    const tasks = await Task.find().sort(sortOption).limit(count); // find : 쿼리를 리턴

    /* 
    * 자바스크립트 정렬함수
    * sort 함수는 기본적으로 배열의 각 element들을 문자열로 보고 정렬을 한다.
    * 숫자이거나 객체의 정렬의 경우 커스텀 함수를 인자로 넣어야 함.
    * compareFn : (a, b) 인자를 받고
    * a - b 값이 음수 -> b가 먼저 정렬
    * a - b 값이 양수 -> a가 먼저 정렬 (즉 음수면 뒤, 양수면 앞에것이 먼저 정렬)
    */

    // const compareFn = 
    //     sort === 'oldest'
    //     ? (a, b) => a.createdAt -  b.createdAt
    //     : (a, b) => b.createdAt - a.createdAt;
        
    // let newTasks = mockTasks.sort(compareFn);

    // if (count) {
    //     newTasks = newTasks.slice(0, count);
    // }

    res.send(tasks);
}));

// :id는 request에서 params에 들어간다. 기본적으로 문자열로 반환됨.
app.get('/tasks/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;
    // 배열의 find함수를 이용해서 id에 해당하는 task json 객체를 반환
    // tasks 배열 안에 있는 각 task의 id를 비교해서 조건에 맞는 task를 반환
    // const task = mockTasks.find((task) => task.id === id);

    const task = await Task.findById(id);

    if (task) {
        res.send(task);
    }
    else {
        res.status(404).send({ message : 'Cannot find given id. '});
    }
}));

app.post('/tasks', asyncHandler(async (req, res) => {
    const newTask = await Task.create(req.body);
    // const newTask = req.body;
    // const ids = mockTasks.map((task) => task.id);
    // newTask.id = Math.max(...ids) + 1;
    // newTask.isComplete = false;
    // newTask.createdAt = new Date();
    // newTask.updatedAt = new Date();

    // mockTasks.push(newTask);
    res.status(201).send(newTask);
}));

app.patch('/tasks/:id', asyncHandler(async (req, res) => {
    // 수정할 task 가져오기
    // const id = Number(req.params.id);
    // const task = mockTasks.find((task) => task.id === id);
    const id = req.params.id;
    const task = await Task.findById(id);

    if (task) {
        // Objects.keys(req.body) : req.body로 받은 json 객체의 키를 배열로 반환.
        // forEach(key => {task[key] = req.body[key]}) : 각 task[key]의 value를 req.body의 value로 수정
        Object.keys(req.body).forEach((key) => {
            task[key] = req.body[key];
        });
        await task.save();
        // task.updatedAt = new Date(); // 수정일 업데이트
        res.send(task);
    }
    else {
        res.status(404).send({ message : 'Cannot find given id. '});
    }
}));

app.delete('/tasks/:id', asyncHandler(async (req, res) => {
    // const id = Number(req.params.id);
    // // id에 해당하는 task 인덱스를 가져온다. 없으면 -1을 반환
    // const idx = mockTasks.findIndex((task) => task.id === id);

    const id = req.params.id;
    const task = await Task.findByIdAndDelete(id);

    if (task) {

        // 배열의 splice(idx, count) : idx번째 부터 count 개수 만큼 배열에서 삭제.
        // mockTasks.splice(idx, 1); // 배열에 해당 task를 삭제
        res.sendStatus(204); // delete의 경우 상태코드만 보낸다. 이때 sendStatus함수를 보냄.
    }
    else {
        res.status(404).send({ message : 'Cannot find given id. '});
    }
}));

app.listen(process.env.PORT || 3000, () => console.log('Server Started'));
