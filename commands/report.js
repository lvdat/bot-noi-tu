const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, InteractionCollector, Client, PermissionsBitField } = require('discord.js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const REPORT_CHANNEL = process.env.REPORT_CHANNEL
const reportWordsPath = path.resolve(__dirname, './data/report-words.json')

/**
 * 
 * @param {String} word 
 * @param {String} reason 
 * @param {String} author 
 * @param {String} svname 
 * @returns {EmbedBuilder}
 */
const reportEmbed = (word, reason, author, svname) => {
    return new EmbedBuilder()
        .setColor(13250094)
        .addFields(
            {
                name: 'Từ báo cáo',
                value: `**${word}**`,
                inline: true
            },
            {
                name: 'Lý do',
                value: reason,
                inline: true
            },
            {
                name: 'Người gửi',
                value: author
            },
            {
                name: 'Máy chủ',
                value: svname,
                inline: true
            }
        )
}

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

            client.channels.cache.get(REPORT_CHANNEL).send({
                embeds: [reportEmbed(word, reason, interaction.user.username, interaction.guild.name)]
            })

            return interaction.reply({
                content: `Đã báo cáo từ **${word}**`,
                ephemeral: true
            })
        }

    }
}