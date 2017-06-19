const express = require('express')
const app = express()
const socketio = require('socket.io')
const path = require('path')

app.use(express.static('public'))
app.use(express.static('node_modules/phaser-ce/build'))
  .get('/', (req, res, next) => res.sendFile(path.join(__dirname, 'index.html')))

const server = app.listen(process.env.PORT || 8080, () => console.log('Running on port 8080'))

const io = socketio(server)


// utils?
const getAllPlayers = () => {
  let players = []
  Object.keys(io.sockets.connected).forEach( socketID => {
    let player = io.sockets.connected[socketID].player
    if (player) players.push(player)
  })
  return players
}

server.lastPlayerID = 0

let players = []

let positions = {
  0: { x: 115, y: 415},
  1: { x: 115, y: 460},
  2: { x: 895, y: 256},
  3: { x: 895, y: 290},
 }

let scoreState = {
  red: { score: 0, nextTarget: 400, currentTile: 1 },
  blue: { score: 0, nextTarget: 400, currentTile: 1 }
}

let mapTiles = [447, 415, 431]

io.on('connection', (socket) => {
  let otherPlayers = getAllPlayers()

  socket.on('newplayer', () => {
    console.log('newplayer!: ', ++server.lastPlayerID)
    socket.player = Object.assign({
      id: server.lastPlayerID,
      hasSeed: false,
    }, positions[server.lastPlayerID % 4])
    players.push(socket.player)

    socket.emit('playerInfo', socket.player)
    io.sockets.emit('tallyPlayers', getAllPlayers())
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

  socket.on('throwSeed', (data) => {
    socket.broadcast.emit('throwSeed', data)
  })

  socket.on('scoreRed', () => {
    scoreState.red.score += 1
    if (scoreState.red.score > scoreState.red.nextTarget) {
      io.sockets.emit('updateMap', {
        team: 'red',
        oldTile: mapTiles[scoreState.red.currentTile - 1],
        newTile: mapTiles[scoreState.red.currentTile++]
      })
      scoreState.red.nextTarget += 400
      if (scoreState.red.nextTarget === 1600) {
        console.log('RED WINS!')
        io.sockets.emit('gameOver', { team: 'Red' })
      }
    }
  })

  socket.on('scoreBlue', () => {
    scoreState.blue.score += 1
    if (scoreState.blue.score > scoreState.blue.nextTarget) {
      io.sockets.emit('updateMap', {
        team: 'blue',
        oldTile: mapTiles[scoreState.blue.currentTile - 1],
        newTile: mapTiles[scoreState.blue.currentTile++]
    })
      scoreState.blue.nextTarget += 400
      if (scoreState.red.nextTarget === 1600) {
        console.log('BLUE WINS!')
        io.sockets.emit('gameOver', { team: 'Blue' })
      }
    }
  })

  socket.on('disconnect', () => {
    console.log('Player disconnected: ', 'bye!')
    socket.broadcast.emit('removePlayer', socket.player)
  })

  socket.on('resetState', () => scoreState = {
    red: { score: 0, nextTarget: 400, currentTile: 1 },
    blue: { score: 0, nextTarget: 400, currentTile: 1 }
  })

  socket.on('test', () => console.log(players))

})

