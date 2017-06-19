/* global io game */

const Client = {}

Client.socket = io.connect()

Client.test = () => Client.socket.emit('test')

Client.askNewPlayer = () => Client.socket.emit('newplayer')

Client.move = (x, y) => Client.socket.emit('move', { x, y })

Client.takeSeed = () => Client.socket.emit('takeSeed')

Client.enterGame = () => Client.socket.emit('enterGame')

Client.throwSeed = (data) => Client.socket.emit('throwSeed', data)

Client.sendScoreRed = () => Client.socket.emit('scoreRed')

Client.sendScoreBlue = () => Client.socket.emit('scoreBlue')

Client.resetState = () => Client.socket.emit('resetState')


Client.socket.on('newplayer', (data) => {
  game.addNewPlayer(data.id, data.x, data.y)
})

Client.socket.on('tallyPlayers', (data) => {
  game.numPlayers = Object.keys(data).length
})

Client.socket.on('playerInfo', (data) => {
  game.id = data.id
  game.startX = data.x
  game.startY = data.y
})

Client.socket.on('allplayers', (data) => {
  let players = data.players

  players.forEach( player => {
    game.addNewPlayer(player.id, player.x, player.y)
  })
})

Client.socket.on('renderPlayer', (data) => game.renderPlayer(data))

Client.socket.on('tookSeed', (data) => {
  console.log(data.id, 'took the seed!')
  game.seedExchange(data.id)
})

Client.socket.on('throwSeed', (data) => {
  game.throwSeed(data.axis, data.direction, data.ox, data.oy)
})

Client.socket.on('updateMap', (data) => {
  game.updateMap(data.team, data.oldTile, data.newTile)
})

Client.socket.on('removePlayer', (data) => {
  if (game.hasStarted) game.removePlayer(data)
  game.numPlayers--
})

Client.socket.on('gameOver', (data) => {
  game.Over(data.team)
})
