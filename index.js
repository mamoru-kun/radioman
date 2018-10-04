const { token, volume, roomId } = require('./config.json')
const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')
const client = new Discord.Client()

// eslint-disable-next-line
Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)]
}

let prevTrack
let playlist

const getPlaylist = () =>
  fs.readdir('./music/', (err, files) => {
    if (err) throw err
    playlist = files
  })

const playMusic = conn => {
  let newTrack = playlist.random()
  while (newTrack === prevTrack) {
    newTrack = playlist.random()
  }

  let stream = path.resolve(__dirname, `./music/${newTrack}`)
  let dispatcher = conn.playStream(stream, { volume })
  prevTrack = newTrack
  console.log(`[${new Date().toUTCString()}] ⏯  ${newTrack}`)

  dispatcher.on('end', () => joinChannel(roomId))
  dispatcher.on('error', () => joinChannel(roomId))
}

const joinChannel = ch => {
  let connection = client.voiceConnections.get(ch)
  if (connection) {
    playMusic(connection)
  } else {
    client.channels.get(ch).join().then(playMusic)
  }
}

client.on('ready', () => {
  console.log('Discord-Podcast by mamoru-kun is ready to play some music!')
  getPlaylist()
  joinChannel(roomId)
})
client.on('error', err => {
  client.destroy()
  console.error(err)
})
client.on('disconnect', () => {
  client.destroy()
  console.log('sorry, connection problems')
})

client.login(token)
