import mongoose from "mongoose"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name should be required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email should be required'],
        trim: true, 
        unique: true,
        lowercase: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please add a valid email address.'],
    },
    password: {
       type: String,
       minLength: [6, 'password must be at least 6 characters'],
       trim: true,

    },

    role:{
        type: String,
        enum: ["ADMIN", "LIBRARIAN", "MEMBER"],
        uppercase: true,
        trim: true
    },
    libraryId : String,
    fineBalance: {
        type: Number,
        default: 0.0
    },
    numberOfBooks: {
        type: Number,
        default: 0,
    },
    isBlocked: {
        type: Boolean,
        default: false
    },

    issuedBook:[
        {
           title: {
                 type: String,
                 ref: "Book",
            },
            BookId:{
                type: String,
                trim: true
            },
          issueDate: {
            type: Date,
            //default: Date.now,
          },
           dueDate: Date
        }
    ],


}, {timestamps: true})


userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.generateJWTToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};



 const  User = mongoose.model("User", userSchema)

 export default User 