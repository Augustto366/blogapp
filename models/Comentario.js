import mongoose from "mongoose";
import { Schema } from "mongoose";

const Comment = new Schema({
    nome: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    slug: {
        type: String
    }
})

mongoose.model('comments', Comment)

export default Comment