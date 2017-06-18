const express = require('express')
const app = express()
const socketio = require('socket.io')
const path = require('path')

app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'node_modules/phaser-ce/build')))
  .get('/', (req, res, next) => res.sendFile(path.join(__dirname, 'index.html')))

const server = app.listen(8080, () => console.log('Running on port 8080'))

const io = socketio(server)

server.lastPlayerID = 1

// utils?
const getAllPlayers = () => {
  let players = []
  Object.keys(io.sockets.connected).forEach( socketID => {
    let player = io.sockets.connected[socketID].player
    if (player) players.push(player)
  })
  return players
}

var players = []

io.on('connection', (socket) => {
  let otherPlayers = getAllPlayers()

  socket.on('newplayer', () => {
    console.log('newplayer!: ', server.lastPlayerID)
    socket.player = {
      id: server.lastPlayerID++,
      hasSeed: false,
      x: 300,
      y: 200
    }
    players.push(socket.player)

    socket.emit('playerInfo', socket.player)
  })

  socket.on('enterGame', () => {
    socket.emit('allplayers', { players: otherPlayers, me: socket.player })
    socket.broadcast.emit('newplayer', socket.player)
  })

  socket.on('move', (data) => {
    socket.player.x = data.x
    socket.player.y = data.y
    socket.broadcast.emit('renderPlayer', socket.player)
  })

  socket.on('takeSeed', () => {
    socket.broadcast.emit('tookSeed', socket.player)
  })

  socket.on('disconnect', () => {
    console.log('Player disconnected: id', socket.player.id || 'bye!')
    socket.broadcast.emit('removePlayer', socket.player)
  })

  socket.on('test', () => console.log(players))

})

