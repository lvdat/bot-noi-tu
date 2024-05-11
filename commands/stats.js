const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('fs')
const path = require('path')
const statsFile = path.resolve(__dirname, '../data/stats.txt')
const queryPath = path.resolve(__dirname, '../data/query.txt')
const wordDatabasePath = path.resolve(__dirname, '../data/words.txt')

let queryNumber = '0'
let dicDataCount = 0

fs.readFile(queryPath, 'utf-8', (err, data) => {
    if (!err) {
        queryNumber = data
    }
});

fs.readFile(wordDatabasePath, 'utf-8', (err, data) => {
    if (!err) {
        dicDataCount = data.toLowerCase().split('\n').length
    }
})

const statEmbed = (client) => new EmbedBuilder()
    .setColor(13250094)
    .addFields(
        {
            name: 'Tổng số server đang sử dụng',
            value: `${client.guilds.cache.size} servers`
        },
        {
            name: 'Tổng số phiên chơi',
            value: '...'
        },
        {
            name: 'Tổng số truy vấn dữ liệu',
            value: `${queryNumber}`
        },
        {
            name: 'Tổng số từ trong ngân hàng từ',
            value: `${dicDataCount}`
        },
    )

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Xem các thống kê của BOT'),

        async execute(interaction, client) {
            await interaction.reply({
                embeds: [statEmbed(client)],
                flags: [4096]
            })
        }
}