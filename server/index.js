import express from 'express';

const app = express();

app.listen(3000, () => {
    try {
        console.log('Server is running on port 3000!');
    } catch (error) {
        console.log(error);
    }  
});