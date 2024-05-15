const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('fs')
const path = require('path')

const rankEmbed = () => new EmbedBuilder()
    .setColor(13250094)
    .setAuthor(`Bảng xếp hạng nối từ `)

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Xem bảng xếp hạng nối từ'),

        async execute(interaction, client) {
            console.log(interaction)
        }
}