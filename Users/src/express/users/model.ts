import mongoose from 'mongoose';
import { config } from '../../config.js';
import { User } from './interface.js';

const usersSchema = new mongoose.Schema<User>(
    {
        badgeId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        versionKey: false,
    },
);

export const usersModel = mongoose.model<User>(config.mongo.usersCollectionName, usersSchema);
