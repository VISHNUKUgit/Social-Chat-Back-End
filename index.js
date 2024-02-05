// Loads .env file contents into process.env by default
require('dotenv').config();
require('./DataBase/connectToDB')

const express = require('express');
const cors = require('cors');
const router = require('./Router/router');
const messages = require('./DataBase/Model/messageModel');

// Create server
const app = express()

app.use(cors())
app.use(express.json())
// establish connection between router and server
app.use(router)


const http = require('http').Server(app);

const PORT = 4000 || process.env.PORT

// add Socket.io to the project to create a real-time connection.
const socketIO = require('socket.io')(http, {
    cors: {
        
        origin:"https://social-chat-front-end.vercel.app"
    }
});

let users = []

socketIO.on('connection', (socket) => {
    console.log(`${socket.id} user just connected!`)  

    socket.on("message", async(data) => {
        console.log(data);
        const newMessage = new messages({
          sender: data.sender,
          recipient: data.recipient,
          content: data.text,
          timestamp: new Date(),
          read: false
          
      });
      await newMessage.save();
      socketIO.emit("messageResponse", data)
    })
    socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));
    

     //Listens when a new user joins the server
  socket.on('newUser', (data) => {
    //Adds the new user to the list of users
    users.push(data);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit('newUserResponse', users);
    console.log(users);
  });
 
    socket.on('disconnect', () => {
      console.log('A user disconnected');
      users = users.filter(user => user.socketID !== socket.id)
      socketIO.emit("newUserResponse", users)
      socket.disconnect()
    });
});

http.listen(PORT, () => {
    console.log(`Chat Server is Live at port:${PORT} and waiting`);
});
app.get('/', (request, response) => {
    response.send(`<h1>Chat Server is Started running at Port number ${PORT}</h1>`);
});

