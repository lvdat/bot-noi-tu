const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('fs')
const path = require('path')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Xem thông tin máy chủ'),

        async execute (interaction, client) {
            await interaction.reply({
                content: 'Test'
            })
        }
}