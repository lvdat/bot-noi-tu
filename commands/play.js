const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dictionary = require('@vntk/dictionary');
let isGameRunning = false;
let lastWord = '';
module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Bắt đầu trò chơi'),
    async execute(interaction) {

        await interaction.reply('')
    }
}