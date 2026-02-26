import User from '../model/user.model.js'
import AppError from '../utils/error.utils.js'
import {sendEmail} from '../utils/sendEmail.js'
import Book from '../model/book.model.js'
import libraryId from '../utils/idGenerate.utils.js'
import bcrypt from 'bcrypt'




const cookieOption = {
    maxAge: 7*24*60*60*1000, // 7 days
    httpOnly: true,
    secure: true,
}


//*
export const adminLogin =async (req, res, next) => {
  try{
    const{email, password} = req.body
   // console.log(req.body)
    if(!email || !password){
      return next (new AppError('enter login details', 400))
    }
    const admin = await User.findOne({role: "ADMIN", $and:[{email}]})
    if(!admin){
      return next (new AppError('not registered email', 404))
    }
   
    
  if(!(await bcrypt.compare(password, admin.password))){
    return next(new AppError('Incorrect Password', 400))
  }

      const token =  await admin.generateJWTToken()
      admin.password = undefined
      
 
    res.cookie('token', token, cookieOption )

    res.status(200).json({
      success: true,
      message: "Login Successfully",
      admin
    })
 
  }catch(e){
    return next (new AppError(e.massage, 400)) 
  }
}

export const logout =  (req, res ,next) => {
   try{
      res.cookie('token', null, {
         secure: true,
         maxAge: 0,
         httpOnly: true
      })

      res.status(200).json({
         success: true,
         message: "User logged out seccessfully"
      })

   }catch(e){
      return next (new AppError(e.message, 400))
   }
}


// export const adminProfile = async(req, res, next) => {

//   try{

//   }catch(e){

//   }
// }



//*


export const registerLibrarian = async (req, res, next) => {

   try{
    const {name, email, role} = req.body
   // console.log(req.body)
    if(!name || !email || !role){
        return next (new AppError ('all fields are required', 400))
    }

    const isExists = await User.findOne({email})
    if(isExists){
    return next (new AppError ('already registered', 400))
    }
    const libraryIdG = await libraryId("LIBRARIAN")
    //console.log("id is ", libraryIdG)
    const tempPassword = Math.random().toString(36).slice(-8) // generating temp password
    const user = await User.create({
        name,
        email,
        password: tempPassword,
        libraryId: libraryIdG,
        role,
    })
   
    try{
       // console.log("password, ", tempPassword)
      const message = `
     <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Dear <strong> ${user.name} </strong>,</p>
      
      <p>
       Congratulations! Your registration as a <strong>Librarian</strong> has been successfully completed 
       in the <strong>Library</strong>.
    </p>

     <p><strong>Here are your login details:</strong></p>

  <p>
     <strong>Library ID:</strong> ${user.libraryId} <br>
    <strong>Email:</strong> ${user.email} <br>
    <strong>Temporary Password:</strong> ${tempPassword}
  </p>

  <p style="color: #d9534f;">
    For security reasons, we strongly recommend that you change your password after your first login.
  </p> 

  <p>
    You can now log in to the system portal and begin managing library operations.
  </p>

  <p>
    If you experience any issues accessing your account, please contact the system administrator.
  </p>

  <br>

  <p>
    Welcome to the team! <br><br>
    Best regards, <br>
    <strong>Library Administration</strong><br>
    
  </p>

   </div> `;

      const subject = "Your Librarian Registration is Successful"

      await sendEmail(email, subject, message)
      res.status(200).json({
        success: true,
        message: 'Registeration successfully completed , Check Mail',
        user: user.libraryId
    })
   }catch(e){ 
        return next (new AppError(e.message, 500))
    }
      
 }catch(e){
     res.status(400).json({
        success: false,
        message: e.message
    }) 
   }
}


//*
export const addBook = async (req, res, next) => {
  
  try{
    const{title, bookId, category} = req.body
    if(!title || !bookId || !category ){
      return next(new AppError('all field requried to fill', 400))
    }

   const bookExists =  await Book.findOne({bookId})
    if(bookExists){
      return next (new AppError('book is already added', 400))
  } 
  else{
      const book = await Book.create({
      title,
      bookId,
      category,
      
    })

    res.status(200).json({
      success: true,
      message: 'book added successfully',
      book
    });
 }

 }catch(e){
    res.status(400).json({
      success: false,
      message: e.message
    })
 }

}



export const dashboard = async (req, res, next) => {

    try{
      
      const admin = req.user

      const totalMember = await User.countDocuments({role: "MEMBER"})
      const Books = await Book.find()

      if(!totalMember || !Books){
        return next(new AppError('data not fected' , 404))
      }

      let totalBooks
      for(let i =0; i<Books.length; i++){
        totalBooks = Books[i].totalCopy + totalBooks
       
      }

      res.status(200).json({
        success: true,
        message: 'welcome to dashboard',
        admin,
        totalBooks,
        totalMember,
        Books,
        
      })


    }catch(e){
      return next(new AppError(e.message, 400))
    }
}


//*
export const registerMember =  async(req, res, next) => {
  try{
    const{name, email } = req.body
    if(!name || !email){
    return next(new AppError('all fields are required', 400))
  }
    const memberExists = await User.findOne({email: email, role: "LIBRARIAN"})
 // console.log(memberExists.email)
   if(memberExists  &&  memberExists.role ==='LIBRARIAN'){
     return next (new AppError('Librarian can not registered as a member', 400))
  }
   if(memberExists){
      return next (new AppError('email already registered', 400))
     }

   const libraryIdG = await libraryId("MEMBER")
   console.log("id is ", libraryIdG)
  const member = await User.create({
    name,
    email,
    role: "MEMBER",
    libraryId: libraryIdG
  })

   const message = `
     <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <p>Dear <strong> ${member.name} </strong>,</p>
      
      <p>
       Congratulations! Welcome to Our Library – 
       in the <strong>Membership Confirmation</strong>.
    </p>

     <p><strong>Welcome to our Library! 🎉
      Your membership has been successfully registered.
     Here are your membership details:</strong></p>

  <p>
     <strong>Library ID:</strong> ${member.libraryId} <br>
  </p>

  <p>You can now start exploring our collection and borrow books according to the library guidelines. </p>
  <p> If you have any questions or need assistance, feel free to contact us. We’re happy to help! </p>

  <p><strong>Thank you for being a part of our library community.</strong></p>

  <p>
     <br><br>
    Best regards, <br>
    <strong>Library Administration</strong><br>
    
  </p>

   </div> `;

      const subject = "Membership Confirmation"

      await sendEmail(email, subject, message)
      res.status(200).json({
        success: true,
        message: 'Registeration successfully completed , Check Mail',
        member: member.libraryId
    })
  }catch(e){
    return next(new AppError(e.message, 400))
  }
}

//*
export const librarianList = async(req, res, next) => {
  try{
     const librarian = await User.find({role: "LIBRARIAN"})
     if(!librarian){
      return next(new AppError('librarian is not found', 400))
     }

     let librarianCount =0; 
     for(let i =0; i<librarian.length; i++){
       librarian[i].password = undefined
       librarianCount++
     }
     console.log(librarianCount) 
     
     res.status(200).json({
      success: true,
      message: 'librarian data fetch successfully',
      librarian,
      librarianCount,
     })

  }catch(e){
    return next(new AppError('error while fetching librarian list', 400))
  }
}

//* //both mem and lib search
export const searchMember = async(req, res, next) =>{
  try{
    const {libraryId} = req.body
    console.log(libraryId)
    if(!libraryId){
         return next (new AppError('Please enter the library Id', 400))
    }
   const member = await User.findOne({libraryId: libraryId.toUpperCase()}).select('-password')
    //console.log("member is: " , member)
   if(!member){
    return next (new AppError('member not found', 404))
   }
  
  

   res.status(200).json({
    success: true,
    message: 'member fetched',
    member,
   })
 

  }catch(e){
    return next (new AppError(e.message, 400))
  }
}


//*
export const issueBook = async (req, res, next) => {
    try {
    const id = req.params.id
    console.log("id is: ", id)

    const { bookId } = req.body;
    if (!bookId) {
      return next(new AppError('please enter book id', 400));
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
      return next(new AppError('book not found', 404))
    }
    if(issueBook.status!=="AVAILABLE"){
      return next(new AppError('book is already issued', 404))
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


  } catch (e) {
    return next(new AppError(e.message, 500));
  }
}

export const returnBook = async(req, res, next) => {
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
  
   const message = `<p>Your Retured book is ${userBook.issuedBook.title}</p>
    <br><br>
    <p><strong>Book Id: ${userBook.issuedBook.bookId}</strong></p>
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
export const memberDisable = async(req, res, next) =>{
  try{
    const id = req.params.id
    const member  = await User.findByIdAndUpdate(id, {isBlocked: true})
    if(!member){
      return next(new AppError('member is not found' , 404))
    }

    res.status(200).json({
      success: true,
      message: 'member is blocked by admin'
    })

  }catch(e){
    return next(new AppError(e.message, 400))
  }
}


export const memberActive = async(req, res, next) => {
  try{

    const id = req.params.id
    const member  = await User.findByIdAndUpdate(id, {isBlocked: false})
    if(!member){
      return next(new AppError('member is not found' , 404))
    }

    res.status(200).json({
      success: true,
      message: 'member is Unblocked by admin'
    })

  }catch(e){
    return next(new AppError(e.message, 400))
  }
}