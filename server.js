const express = require('express')
const app = express()
const path = require('path')

app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'node_modules/phaser-ce/build')))

  .get('/', (req, res, next) => res.sendFile(path.join(__dirname, 'index.html')))

  .listen(8080, () => console.log('Running on port 8080'))
