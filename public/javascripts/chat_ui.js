function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}


//处理原始的用户输入
function processUserInput(chatApp, socket) {

  $(document).ready(function() {
    var message = $('#send-message').val();
    var systemMessage;
      if (message.substring(0,1) == '/') {
        systemMessage = chatApp.processCommand(message);
        alert("命令")
        if (systemMessage) {
          $('#messages').append(divEscapedContentElement(message));
        }
      } else {
        //将非命令输入广播给其他用户
        chatApp.sendMessage($('#room').text(), message);
        $('#messages').append(divSystemContentElement(message));
        $('#messages').scrollTop($('#messages').prop('scrollHeight'));
      }
      $('#send-message').val('');
  })

}

var socket = io.connect();

$(document).ready(function() {
  var chatApp = new Chat(socket);

  //显示更名尝试的结果
  socket.on('nameResult', function(result) {
    var message;
    
    if (result.success) {
      message = 'You are now known as ' + result.name + '.';
    } else {
      message = result.message;
    }
    $('#messages').append(divSystemContentElement(message));
  });

  //显示房间变更结果
  socket.on('joinResult', function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  //显示接收到的信息
  socket.on('message', function(message) {
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });

  //显示可用房间列表
  socket.on('rooms', function(rooms) {
    $('#room-list').empty();
    alert(rooms);
    for(var room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
        $('#room-list').append(divEscapedContentElement(room));
      }
    }

    //点击切换房间
    $('#room-list div').click(function() {
      chatApp.processCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });
  });

  //定期请求可用房间列表
  setInterval(function() {
    socket.emit('room');
  }, 1000)
  
  $('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
  });
});