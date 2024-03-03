const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-channel')
        .setDescription('Cài đặt kênh chơi nối từ')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Kênh chơi nối từ')
                .setRequired(true))
}