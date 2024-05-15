const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('fs')
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('me')
        .setDescription('Xem thống kê nối từ của bạn'),

        async execute(interaction, client) {
            console.log(interaction)
        }
}