import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import commentRoutes from './routes/comment.route.js';
import cookieParser from 'cookie-parser';



dotenv.config();

mongoose
    .connect(process.env.MONGO)
    .then(() => {
        console.log('Connected to MongoDB!') 
    })
    .catch((err) => {
        console.log(err);
    });


const app = express();

app.use(express.json());
app.use(cookieParser());

app.listen(3000, () => {
    try {
        console.log('Server is running on port 3000!');
    } catch (error) {
        console.log(error);
    }  
});


// Once you create the route elsewhere, you can use them here
app.use('/server/user', userRoutes);
app.use('/server/auth', authRoutes);
app.use('/server/post', postRoutes);
app.use('/server/comment', commentRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});