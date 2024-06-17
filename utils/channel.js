const fs = require('fs')
const path = require('path')

const dataPath = path.resolve(__dirname, '../data/data.json')

/**
 * 
 * @param {Number} guildId 
 * @param {Number} channelId 
 */
const setChannel = (guildId, channelId) => {
    const dataChannel = require(dataPath)
    dataChannel[guildId] = {
        channel: channelId
    }

    fs.writeFileSync(dataPath, JSON.stringify(dataChannel))
}

module.exports = {
    setChannel
}