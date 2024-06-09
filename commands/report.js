const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, InteractionCollector, Client, PermissionsBitField } = require('discord.js')
require('dotenv').config()
const REPORT_CHANNEL = process.env.REPORT_CHANNEL

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Báo cáo từ ngữ không phù hợp trong từ điển')
        .addStringOption(option => 
            option
                .setName('word')
                .setDescription('Từ muốn báo cáo')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Lý do (không bắt buộc)')
        ),
    /**
     * 
     * @param {InteractionCollector} interaction 
     * @param {Client} client 
     */
    async execute (interaction, client) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return await interaction.reply({
                content: 'Bạn cần có quyền admin để báo cáo từ.',
                ephemeral: true
            })
        } else {
            let word = interaction.options.getString('word')
            let reason = interaction.options.getString('reason') ?? 'No reason provided.'
            
        }

    }
}