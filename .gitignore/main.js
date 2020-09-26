const socket = io('https://stream1604.herokuapp.com/');

$('#divChat').hide();

socket.on('server-send-list-online', users => {
    $('#ulUser').html('');
    users.forEach(user => {
        const { userName, peerId } = user;

        $('#ulUser').append('<li id="' + peerId + '">' + userName + '</li>')
    });
});

socket.on('server-send-user', user => {
    $('#divChat').show();
    $('#divRegister').hide();
})

socket.on('register-error', () => {
    alert('User Name already existed.');
});

socket.on('diconnect-user', peerId => {
    debugger;
    $(`#${peerId}`).remove();
})

function openStream() {
    const config = { audio: false, video: true };
    return navigator.mediaDevices.getUserMedia(config);
};

function playStream(idVideotag, stream) {
    const video = document.getElementById(idVideotag);
    video.srcObject = stream;
    video.play();
};


const peer = new Peer();

peer.on('open', function (id) {
    $('#my-peer-Id').append(id);

    $('#btnSignUp').click(function () {
        const username = $('#txtUsername').val();

        socket.emit('register', { userName: username, peerId: id });
    });
});

// Caller
$('#btnCall').click(function () {
    const id = $('#remoteId').val();
    openStream()
        .then(stream => {
            playStream('localStream', stream);

            const call = peer.call(id, stream);
            call.on('stream', remoteStream => {
                playStream('remoteStream', remoteStream);
            });
        })
});

peer.on('call', call => {
    openStream()
        .then(stream => {
            call.answer(stream);
            playStream('localStream', stream);

            call.on('stream', remoteStream => {
                playStream('remoteStream', remoteStream);
            });
        });
});

$('#ulUser').on('click', 'li', function () {
    const id = $(this).attr('id');

    openStream()
        .then(stream => {
            playStream('localStream', stream);

            const call = peer.call(id, stream);
            call.on('stream', remoteStream => {
                playStream('remoteStream', remoteStream);
            });
        })
});