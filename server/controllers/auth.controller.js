import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';

export const signup = async (req, res) => {
    const { username, email, password } = req.body;

    // If username, email, or password are missing, or if they are empty strings, return an error message
    if (!username || !email || !password || username === '' || email === '' || password === '') {
        return res.status(400).json({message: 'All fields are required'});
    }
    if (password.length < 7) { // Require strong(ish) passwords
        return res.status(400).json({message: 'Password must be at least 7 characters long'});
    } 


    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({username, email, password: hashedPassword});
    try {
        await newUser.save();
        return res.status(201).json({message: 'User created successfully'});
    }
    catch (error) {
        return res.status(500).json({message: error.message});
    }
    
}