/* global io game */

const Client = {}

Client.socket = io.connect()

Client.askNewPlayer = () => Client.socket.emit('newplayer')

Client.move = (x, y) => Client.socket.emit('move', { x, y })


Client.socket.on('newplayer', (data) => game.addNewPlayer(data.id, data.x, data.y))

Client.socket.on('allplayers', (data) => {
  let players = data.players
  players.forEach( player => {
    game.addNewPlayer(player.id, player.x, player.y)
  })
})

Client.socket.on('renderPlayer', (data) => game.renderPlayer(data))

Client.socket.on('removePlayer', (data) => {
  game.removePlayer(data)
})
