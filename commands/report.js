const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Báo cáo từ ngữ không phù hợp trong từ điển'),

        async execute (interaction, client) {
            await interaction.reply({
                content: 'Report command.'
            })
        }
}