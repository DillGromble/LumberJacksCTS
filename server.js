const express = require('express')
const app = express()
const socketio = require('socket.io')
const path = require('path')

app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'node_modules/phaser-ce/build')))
  .get('/', (req, res, next) => res.sendFile(path.join(__dirname, 'index.html')))

const server = app.listen(8080, () => console.log('Running on port 8080'))

const io = socketio(server)

server.lastPlayerID = 0

io.on('connection', function(socket) {
  let otherPlayers = getAllPlayers()
  socket.on('newplayer', function () {
    console.log('newplayer!: ', server.lastPlayerID)
    socket.player = {
      id: server.lastPlayerID++,
      x: 300,
      y: 200
    }
    socket.emit('allplayers', { players: otherPlayers, id: socket.player.id })
    socket.broadcast.emit('newplayer', socket.player)
  })

  socket.on('move', function (data) {
    socket.player.x = data.x
    socket.player.y = data.y
    socket.broadcast.emit('renderPlayer', socket.player)
  })
})



function getAllPlayers () {
  let players = []
  Object.keys(io.sockets.connected).forEach( socketID => {
    let player = io.sockets.connected[socketID].player
    if (player) players.push(player)
    // console.log(player)
  })
  return players
}
