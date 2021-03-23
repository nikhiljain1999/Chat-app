const users=[]
// adduser ,removeUser,getuser ,getusersinroom

const addUser =({id,username,room})=>{
    //clean he data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validate data
    if(!username || !room){
        return {
            error:'User name and room are require'
        }
    }
    //check for existing user
    const existingUser=users.find((user)=>{
        return user.room===room && user.username===username
    })
    // validate username
    if(existingUser){
        return{
            error:"User name is in use"
        }
    }
    //Store user
    const user ={id,username,room}
    users.push(user)
    return {user}
}
const removeUser=(id)=>{
    const index= users.findIndex((user)=> user.id ===id)
    if(index !==-1)
    {
        return users.splice(index,1)
    }
    
}
const getUser=(id)=>{
    return users.find((user)=> user.id ===id)
   
}
const getUserInRoom=(room)=>{
    return users.filter((user)=>user.room===room)
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}