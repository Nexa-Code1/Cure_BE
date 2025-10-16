import connection from "./DB/connection.js";
import express from "express";
import { userRouter } from "./Modules/Auth/auth.controller.js";
const app = express();


const bootstrap = async () => {
    await connection();
    app.use(express.json());

    app.use('/api', userRouter);


    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    }).on('error', (error) => {
        console.error('Server error:', error);
    });
}

export default bootstrap;