import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';

export const test = (req, res) => {
    res.json({message: 'API is working!'})
};

// first we want to make sure that the user is authentication
// check the cookie of the browser, but we want to do this for all related functions which need this (so we make util function)
export const updateUser = async(req, res, next) => {

    if (req.user.id != req.params.userId) {
        return next(errorHandler(403, 'You are not alllowed to update this user'));
    }

    if (req.body.password) {
        if (req.body.password.length < 7) {
            return next(errorHandler(400, 'Password must be at least 6 characters long'));
        }
        req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    if (req.body.username) {
        if (req.body.username.length < 7 || req.body.username.length > 20) {
            return next(errorHandler(400, 'Username must be between 7 and 20 characters long'));
        }
        if (req.body.username.includes(' ')) {
            return next(errorHandler(400, 'Username must not contain any spaces'));
        }
        if (req.body.usernane != req.body.username.toLowerCase()) {
            req.body.username = req.body.username.toLowerCase();
        }
        if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
            return next(errorHandler(400, 'Username must contain only letters and numbers'));
        }

        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.userId, {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    profilePicture: req.body.profilePicture,
                    password: req.body.password,
                },
            }, { new: true });
            const { password, ...rest } = updatedUser._doc;
            res.status(200).json(rest);

        } catch (error) {
            next(error);
        }
    }
};