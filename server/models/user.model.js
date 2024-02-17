import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
        username: {
            type: String,
            required: true,
            unique: true,
            min: 1
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        }, 
        profilePicture: {
            type: String,
            default: "https://i.pinimg.com/474x/d5/c3/da/d5c3dad529dff7caad63ae899c7af0e9.jpg",
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    }, {timestamps: true}
);


const User = mongoose.model('User', userSchema); 

export default User;