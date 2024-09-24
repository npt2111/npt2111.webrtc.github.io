const socket = io('https://b1d4-113-165-213-72.ngrok-free.app');

$('#div-chat').hide();
$('#divEnd').hide();

socket.on('AI_DO_NGAT_KET_NOI', peerId => {
    $('#' + peerId).remove();
});
socket.on('DANH_SACH_ONLINE', arrUserInfor => {
    $('#div-chat').show();
    $('#div-dang-ky').hide();
    arrUserInfor.forEach(user => {
        const {ten, peerId} = user;
        $('#ulUser').append('<li id="'+peerId+'">'+ten+'</li>');
    });
    socket.on('CO_NGUOI_DUNG_MOI', user => {
        const {ten, peerId} = user;
        $('#ulUser').append('<li id="'+peerId+'">'+ten+'</li>');
    });
    
});
socket.on('callEnded', () => {
    // Xử lý sự kiện khi cuộc gọi kết thúc
    closeStream('localStream');
    closeStream('remoteStream');
    
    alert('Cuộc gọi đã kết thúc.');
    $('#divEnd').hide();
    $('#divCall').show();
    // Thực hiện các hành động khác nếu cần
});

socket.on('DANG_KY_THAT_BAI', () => alert('Vui long chon ten khac!'));



function openStream(){
    const config = {audio: false, video: true};
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream){
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

function closeStream(idVideoTag){
    const video = document.getElementById(idVideoTag);
    const stream = video.srcObject;

    if (stream) {
        // Dừng tất cả các track của stream
        stream.getTracks().forEach(track => track.stop());
        // Đặt srcObject của video element thành null
        video.srcObject = null;
        video.pause();
    }
   
}

// openStream()
// .then(stream => playStream('localStream',stream));

const peer = new Peer();

peer.on('open', id => {
    $('#my-peer').append(id);
    $('#btnSignup').click(() => {
        const username = $('#txtUsername').val();
        socket.emit('NGUOI_DUNG_DANG_KY',  { ten: username, peerId: id});
    });

});

//Caller
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    $('#divEnd').show();
    $('#divCall').hide();
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

peer.on('call', call => {
    $('#divEnd').show();
    $('#divCall').hide();
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

$('#ulUser').on('click', 'li', function() {
    const id = $(this).attr('id');
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        const call = peer.call(id, stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

$('#btnCopy').click(() => {
    const peerId = $('#my-peer').text().split(': ')[1];
        
    // Tạo một trường văn bản tạm để sao chép
    const tempInput = document.createElement('input');
    tempInput.value = peerId;
    document.body.appendChild(tempInput);
    
    // Chọn nội dung của trường văn bản tạm
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // Đối với thiết bị di động
    
    // Thực hiện lệnh sao chép
    document.execCommand('copy');
    
    // Xóa trường văn bản tạm sau khi sao chép
    document.body.removeChild(tempInput);
    
    alert('Đã copy ID: ' + peerId);
});

// Đối tượng PeerConnection

$('#btnEnd').click(() => {
    const localStream = document.getElementById('localStream').srcObject;
    const remoteStream = document.getElementById('remoteStream').srcObject;

    // Đóng stream
    closeStream('localStream', localStream);
    closeStream('remoteStream', remoteStream);
    socket.emit('endCall');
    alert('Kết thúc cuộc gọi!');
    $('#divEnd').hide();
    $('#divCall').show();
});