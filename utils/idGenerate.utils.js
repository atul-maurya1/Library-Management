
const libraryId = async (role) => {
     let pre
     if(role=="MEMBER") pre =" MEM-"
     else pre = "LIB-"
    
 const id =  pre+(Math.random().toString(36).substring(2, 8).toUpperCase())
 // console.log('id' , id)
 return id;
}

export default libraryId

