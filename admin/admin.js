import User from '../model/user.model.js'

 const admin = async () => {
    
     try{
       const isAdminExistis = await User.findOne({email: "akmaury80@gmail.com"})
     //  console.log(isAdminExistis)
       
        if(!isAdminExistis){
             await User.create({
                name: "atul maurya",
                email: "akmaury80@gmail.com",
                password: process.env.PASSWORD,
                role: "admin"
            })
        }
      
     }catch(e){
        console.log("error while creating admin: ", e)
     }
     
}  
 
export default admin
  
    