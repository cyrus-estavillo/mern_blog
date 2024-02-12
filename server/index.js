import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.route.js';
import authRoutes from './routes/auth.route.js';

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

app.listen(3000, () => {
    try {
        console.log('Server is running on port 3000!');
    } catch (error) {
        console.log(error);
    }  
});

app.use(express.json());

// Once you create the route elsewhere, you can use them here
app.use('/server/user', userRoutes);
app.use('/server/auth', authRoutes);