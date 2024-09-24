// const io = require('socket.io')(3000, {
//     cors: {
//         origin: ["http://127.0.0.1:5500"],
//         credentials: true,
//     },
// });

// io.on('connection', socket =>{
//     console.log(socket.id);
// });
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer();
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

const arrUserInfor = [];

io.on('connection', socket => {
    // console.log('Client connected: ', socket.id);
    // socket.on('disconnect', () => {
    //     console.log('Client disconnected');
    // });

    
    socket.on('NGUOI_DUNG_DANG_KY', user => {
        const isExist = arrUserInfor.some(e => e.ten === user.ten);
        socket.peeId = user.peerId;

        if(isExist){
            return socket.emit('DANG_KY_THAT_BAI');
        }
        arrUserInfor.push(user);

        socket.emit('DANH_SACH_ONLINE', arrUserInfor);
        socket.broadcast.emit('CO_NGUOI_DUNG_MOI', user);

    });
    socket.on('endCall', () => {
        socket.broadcast.emit('callEnded');
    });

    socket.on('disconnect', () => {
        const index = arrUserInfor.findIndex(user => user.peerId === socket.peerId);
        if (index !== -1) {
            arrUserInfor.splice(index, 1);  // Xóa người dùng khỏi mảng
            socket.emit('AI_DO_NGAT_KET_NOI', socket.peerId);  // Phát sự kiện cho các client khác
            io.emit('DANH_SACH_ONLINE', arrUserInfor);
        }
    });

});



const port = 3001; // Thay đổi cổng
server.listen(port, () => {
    console.log(`Server is running on http://127.0.0.1:${port}`);

});