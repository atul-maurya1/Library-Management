import User from '../model/user.model.js'
import AppError from '../utils/error.utils.js'
import bcrypt from 'bcrypt'
import Book from '../model/book.model.js'
import {sendEmail} from '../utils/sendEmail.js'

const cookieOption = {
    maxAge: 7*24*60*60*1000, // 7 days
    httpOnly: true,
    secure: true,
}


export const login = async (req, res, next) => {

    try{
        const {email, password} = req.body
        if(!email || !password){
            return next (new AppError('please provide email and password' , 400))
        }
        const user = await User.findOne({role: 'LIBRARIAN', email}).select('+password')
        if(!user){
            return next (new AppError('invalid email or password' , 400))
        }
        const isPasswordMatched = await bcrypt.compare(password, user.password)
        if(!isPasswordMatched){
            return next (new AppError('invalid email or password' , 400))
        }
     
        const token =  await user.generateJWTToken()
       
        user.password = undefined
        res.cookie('token', token, cookieOption)
        res.status(200).json({
            success: true,
            message: 'login successful',
            user
        })

    }catch(e){
        return next (new AppError('error while login' , 400))
    }
}


export const logout = async(req, res, next) => {
    res.clearCookie('token', cookieOption)
    res.status(200).json({
        success: true,
        message: 'logout successful'
    })
}

export const getDashboard = async(req, res, next) => {
    try{
        const librarian = req.user
        const totalMembers = await User.countDocuments({role: 'MEMBER'})
        const totalBooks = await Book.countDocuments()
       
        res.status(200).json({
            success: true,
            message: 'dashboard data fetched successfully',
            librarian,
            totalMembers,
            totalBooks,
            
        })

    }catch(e){
        return next (new AppError('error while fetching dashboard data' , 400))
    }
}


export const findMember = async(req, res, next) => {
    try{
         const {libraryId} = req.body
         if(!libraryId){
             return next (new AppError('enter the library Id', 400))
         }

         const user = await User.findOne({role: "MEMBER", $and: [{libraryId}]}).select('-email')
         if(!user){
            return next (new AppError('enter valid id', 400))
         }
        
         res.status(200).json({
            success: true,
            message: 'member find successfully',
            user
         })

    }catch(e){
        return next (new AppError('error while finding member' , 400))
    }
} 


export const bookIssue = async (req, res, next) => {
    try{
        
        const id = req.params.id

        const{bookId} = req.body
        if(!bookId){
            return next(new AppError('enter book id ', 400))
        }

        const member = await User.findById({_id: id, role: "MEMBER"});
        if(!member) {
        return next(new AppError("not found", 404))
        }
        if(member.role !== "MEMBER"){
        return next(new AppError("you can't issue book"), 400)
        } 
        if(member.isBlocked===true){
        return next(new AppError('member id is blocked', 400))
        }
        if(member.numberOfBooks === 3){
            return next (new AppError('you have already 3 books', 400))
        }

        
        const issueBook = await Book.findOne({bookId: bookId.toUpperCase()})
        if(!issueBook){
            return next (new AppError('book not found', 404))
        }
       if(issueBook.status === "ISSUED"){
        return next (new AppError('book is already issued', 400))
       }
       
       
    const issueDate = new Date();

    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 15);

    const bookIsIssued ={
      title: issueBook.title,
      BookId: issueBook.bookId,
      issueDate: issueDate,
      dueDate: dueDate

    }


    member.issuedBook.push(bookIsIssued)
    member.numberOfBooks = member.issuedBook.length;
    issueBook.status = "ISSUED"
    await issueBook.save()
    await member.save()
  
        const message = `<p>Your issued book is ${issueBook.title}</p>
        <br><br>
        <p><strong>Book Id: ${issueBook.bookId}</strong></p>
        <br><br>
        <p>Issue Date: ${issueDate} </p>
        <p>Return Date: ${dueDate} </p>  `
    
        const subject = "Book Issued Successfully"
        const email = member.email
    
        await sendEmail(email, subject, message)
        res.status(200).json({
          success: true,
          message: 'Book issued successfully',
          member
        }); 


    }catch(e){
        return next (new AppError('error while issuing book', 400))
    }
}



export const returnBook = async (req, res, next) => {
 try{
  const{bookId} = req.body
  const id = req.params.id

  const book = await Book.findOne({bookId})
  if(!book){
    return next (new AppError('book not found', 404))
  }
  
  
  const userBook = await User.findById(id).populate("issuedBook")
  const userId = userBook._id

  let isMatched = false
  let i
  for( i =0; i<userBook.issuedBook.length; i++){ 
     if( userBook.issuedBook[i].BookId===bookId)
        isMatched = true;
          if(isMatched===true){
          let issuedId = userBook.issuedBook[i]._id
        // console.log("userId ", userId)

         await User.findByIdAndUpdate( userId, {
         $pull: { issuedBook: { _id: issuedId } }
     });
     break;
   }
} 
 console.log(isMatched)
 if(isMatched!==true){
  return next (new AppError('member have not this book', 404)) 
 }
 // console.log("member have book: ")

  book.status = "AVAILABLE"
  userBook.numberOfBooks--;
  
  await userBook.save()
  await book.save()
  
   const message = `<p>Your Retured book is ${book.title}</p>
    <br><br>
    <p><strong>Book Id: ${book.bookId}</strong></p>
    <br><br>  `

    const subject = "Book Return Successfully"
    const email = userBook.email

    await sendEmail(email, subject, message)
    res.status(200).json({
    success: true,
    message: `book- ${userBook.issuedBook.title} is returned successfully`
  })
  }catch(e){
  return next(new AppError('problem during return book', 400))
  }

}


export const getProfile= async (req, res, next) => {
    try{
           const id = req.user.id
        const user = await User.findById(id).select('-password')
        if(!user){
            return next(new AppError('not found', 404))
        }
        res.status(200).json({
            success: true,
            message: 'profile data fetched successfully',
            user
        })

    }catch(e){
        return next(new AppError(e.message, 400))
    }
}

export const changePassword = async(req, res ,next) => {
     try{
        const id = req.user.id

        const {libraryId, password} = req.body
        if(!libraryId || !password){
            return next(new AppError('please enter details', 400))
        }
        const user = await User.findOne({  $and: [{ _id: id },{ libraryId: libraryId }  ]})
        if(!user){
            return next (new AppError('wrong library Id', 400))
        }
        

        user.password = password
        await user.save()
        res.clearCookie('token', cookieOption)
        res.status(200).json({
            success: true,
            message: 'password changed successfully',
        })

        

     }catch(e){
        return next (new AppError('error while chaning password', 400))
     }
}


export const addBook = async (req, res, next) => {
    try{

        const{title, bookId, category } = req.body
           if(!title || !bookId || !category){
            return next (new AppError('fill all details', 400))
           }

           const book = await Book.findOne({bookId})
           if(book){
            return next (new AppError('book already added', 400))
           }

           const addBook = await Book.create({
            title,
            bookId,
            category,
           })

           res.status(201).json({
            success: true,
            message: 'book added successfully',
            addBook
           })

    }catch(e){
        return next( new AppError('error while adding book', 400))
    }
}