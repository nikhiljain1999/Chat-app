const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const { Socket } = require('dgram')
const Filter = require('bad-words')
const {addUser,removeUser,getUser,getUserInRoom}=require('./utils/users')
const app = express()
const port = process.env.PORT || 3000
const server = http.createServer(app)
const {generateMessage}=require('./utils/messages')
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')

io.on('connect', (socket) => {
    console.log()
})
app.use(express.static(publicDirectoryPath))
//let count =0
io.on("connection", (socket) => {
    console.log("new websocket connection")
    // socket.emit('countUpdated',count)
    // socket.on("increment",()=>{
    //     count++
    //     //socket.emit("countUpdated",count)
    //     io.emit("countUpdated",count)
    // })
    
    socket.on('join',(options,callback)=>{
        const {error,user}= addUser({id:socket.id ,...options})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit("message", generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        callback()

    })
    socket.on("sendMessage", (message, callback) => {
        const user =getUser(socket.id)
        
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profaneity not allowed')
        }
        io.to(user.room).emit("message", generateMessage(user.username,message))
        callback('Delevered')

    })
    socket.on('disconnect', () => {
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit("message", generateMessage(`${user.username} has left` ))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }
    })

    socket.on("sendlocation", (location, callback) => {
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateMessage(user.username,`https://www.google.com/maps/?q=${location.latitude},${location.longitude}`))
        callback()
    })
})





server.listen(port, () => {
    console.log("Server is up on Port " + port)
})