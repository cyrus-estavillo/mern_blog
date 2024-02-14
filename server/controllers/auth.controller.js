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


export const google = async (req, res, next) => {
    const { name, email, googlePhotoUrl } = req.body;

    try {
        const user = await User.findOne({ email });
        // if user exists, we create a token using jwt
        if (user) { 
            const token = jwt.sign({ id: user._id}, process.env.JWT_TOKEN);
            const { password, ...rest } = user._doc;
            // httpOnly so that cookie cannot be accessed by client-side scripts
            res.status(200).cookie('access_token', token, {
                httpOnly: true, 
            }).json(rest);
        }
        // if user doesn't exist, we create a new user
        else {
            // we create a random password, since user doesn't yet have a pw but we want to sign them in
            // take a random number, convert it to a string, and take the last 8 characters
            // without slice, we'd get something like 0.123456789, and we'd only want 12345678
            // to make it more secure, we do it twice
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({
                // Cyrus Estavillo => cyrusestavillo1625
                // split names, join them, make them lowercase, and add a random number
                // note that doing math.random().toString(9) gets us only numbers, not numbers and letters
                username: name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4),
                email,
                password: hashedPassword,
                profilePicture: googlePhotoUrl,
            });

            // save new user
            await newUser.save();
            // create token
            const token = jwt.sign({ id: user._id}, process.env.JWT_TOKEN);
            const { password, ...rest } = user._doc;
            // cookie cannot be accessed by client-side scripts
            res.status(200).cookie('access_token', token, {
                httpOnly: true, 
            }).json(rest);
        }
    } catch (error) {
        next(error);
    }
}