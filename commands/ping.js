const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Kiểm tra độ trễ đến BOT!'),
	async execute(interaction) {
		await interaction.reply(`🏓 Latency is ${Math.floor((Date.now() - interaction.createdTimestamp)/1000)}ms. \n🏓 API Latency is ${Math.round(interaction.client.ws.ping)}ms.`);
        console.log(Date.now())
        console.log(interaction.createdTimestamp)
    },
};