import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            maxLength: 30,
        },
        description: {
            type: String,
        },
        isComplete: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

const Task = mongoose.model('Task', TaskSchema); // 몽고DB는 tasks에 CRUD

export default Task;