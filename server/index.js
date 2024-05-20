const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const io = new Server(
    {
        cors:true
    }
);
const app = express();

app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on('connection', socket => {
    console.log('new connection');
    
    socket.on('join-room',(data)=>{
        const {roomId,emailId} = data;  
        console.log('user ',emailId,' joined room ',roomId);
        emailToSocketMapping.set(emailId,socket.id)  
        socketToEmailMapping.set(socket.id,emailId)
        socket.join(roomId);
        socket.emit('joined-room', {roomId});
        socket.broadcast.to(roomId).emit('user-joined',{emailId});
    })

    socket.on('call-user', ({emailId,offer})=>{
        const fromEmail = socketToEmailMapping.get(socket.id);
        const socketId = emailToSocketMapping.get(emailId);
        console.log('calling user',emailId);
        console.log('calling user from email',fromEmail);
        console.log(offer);
        socket.to(socketId).emit('incomming-call',{ from: fromEmail, offer })
    });

    socket.on('call-accept', ({emailId,ans})=>{
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit('call-accept',{ans})
    })
});

app.listen(8000,()=>console.log('running on 8000'));
io.listen(8001);