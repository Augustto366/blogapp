import mongoose from "mongoose";
import { Schema } from "mongoose";

const User = new Schema ({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        required: true
    }
})

mongoose.model('users', User)

export default User