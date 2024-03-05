const { SlashCommandBuilder, ChannelType } = require('discord.js');
const fs = require('fs')
const dataChannel = require('../data/data.json')

// console.log(dataChannel['1212461534861729792'] === undefined)
// console.log(dataChannel['12124615348617297923'] === undefined)
// dataChannel['12124615348617297923'] = {
//     channel: '12345678'
// }
// fs.writeFileSync('../data/data.json', JSON.stringify(dataChannel))
// console.log(dataChannel['12124615348617297923'] === undefined)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-channel')
        .setDescription('Cài đặt kênh chơi nối từ')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Kênh chơi nối từ')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true))
}