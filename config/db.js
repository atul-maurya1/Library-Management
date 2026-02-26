import mongoose from 'mongoose'

const MONGO_URL = process.env.MONGO_URL 

 const connectDb = () => {
      try{
        mongoose.connect(MONGO_URL)
        .then((res) => {
            console.log("db connected: ", res.connection.host)
        })
        .catch((err) => {
            console.log("error while connecting to db: ", err)
        })
      }catch(err){
        console.log("error while connecting to db: ", err)
      }
       
    
}

export default connectDb  
 