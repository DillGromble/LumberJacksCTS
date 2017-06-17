/* global io game */

const Client = {}

Client.socket = io.connect()

Client.askNewPlayer = function () {
  Client.socket.emit('newplayer')
}

Client.socket.on('newplayer', function (data) {
  game.addNewPlayer(data.id, data.x, data.y)
})

Client.socket.on('allplayers', function (data) {
  let players = data.players
  game.id = data.id
  for (var i = 0; i < players.length; i++) {
    game.addNewPlayer(players[i].id, players[i].x, players[i].y)
  }
})

Client.socket.on('renderPlayer', function (data) {
  game.renderPlayer(data)
})

Client.move = function (x, y) {
  Client.socket.emit('move', { x, y })
}
