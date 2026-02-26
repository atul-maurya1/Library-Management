import mongoose from "mongoose"

const bookSchema  = mongoose.Schema({
    title: {
        type: String,
        required: [true, 'title of the book is required'],
        trim: true

    },
    bookId: {
        type: String,
        required: [true, 'book id must'],
        trim: true

    },
    category: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["AVAILABLE", "ISSUED"],
        trim: true,
        default: "AVAILABLE"
    }

}, {timestamps: true})

 const Book = mongoose.model("Book", bookSchema)
 export default Book 