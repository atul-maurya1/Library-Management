// import mongoose from "mongoose"

// const issuedBookSchema = mongoose.Schema({
//     member: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },
//      issuedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     }, 
//      book: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Book",
//         required: true
//     },
//     issueDate: {
//         type: Date,
//         default: Date.now
//     },
//     dueDate: Date
// }, {timestamps: true})

//  const Issue = mongoose.model("Issue", issuedBookSchema)
//  export default Issue