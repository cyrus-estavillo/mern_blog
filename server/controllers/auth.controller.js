import User from "../models/user.model.js";
import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';


export const signup = async (req, res, next) => {
    const { email, password } = req.body;

    // If username, email, or password are missing, or if they are empty strings, return an error message
    if (!username || !email || !password || username === '' || email === '' || password === '') {
        next(errorHandler(400, 'All fields are required'));
    }
    if (password.length < 7) { // Require strong(ish) passwords
        next(errorHandler(400, 'Password must be at least 7 characters long'));
    } 


    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newUser = new User({username, email, password: hashedPassword});
    try {
        await newUser.save();
        return res.status(201).json({message: 'User created successfully'});
    }
    catch (error) {
        next(error);
    }
};


export const signin = async(req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password || email === '' || password === '') {
        next(errorHandler(400, 'All fields are required'));
    }

    try {
        const validUser = await User.findOne({ email });
        if(!validUser) {
            return next(errorHandler(404, 'User not found'));
        }

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) {
            return next(errorHandler(401, 'There is no account associated with the following credentials. Please try again.'));
        }
        
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_TOKEN, { expiresIn: '24h' });

        const { password: pass, ...rest} = validUser._doc;

        res.status(200).cookie('access_token', token, {
            httpOnly: true, }).json(rest);

    } catch (error) {
        next(error);
    }
}