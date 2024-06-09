const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, InteractionCollector, Client, PermissionsBitField, ButtonStyle } = require('discord.js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()
const REPORT_CHANNEL = process.env.REPORT_CHANNEL
const reportWordsPath = path.resolve(__dirname, './data/report-words.json')

/**
 * 
 * @param {Object} wordData 
 * @param {Number} status
 * @returns {EmbedBuilder}
 */
const reportEmbed = (wordData, status = 0) => {
    return new EmbedBuilder()
        .setColor(13250094)
        .setThumbnail(wordData.guildIcon)
        .addFields(
            {
                name: ':regional_indicator_p: Từ báo cáo',
                value: `**${wordData.word}**`,
                inline: true
            },
            {
                name: ':bulb: Lý do',
                value: wordData.reason,
                inline: true
            },
            {
                name: ':bust_in_silhouette: Người gửi',
                value: wordData.user,
                inline: true
            },
            {
                name: ':shield: Máy chủ',
                value: wordData.guildName,
                inline: true
            },
            {
                name: ':id: ID server',
                value: wordData.guildId,
                inline: true
            },
            {
                name: 'Trạng thái',
                value: (status === 0) ? ':clock12: Đang chờ' : (status === 1) ? ':white_check_mark: Đã đồng ý' : ':x: Đã từ chối',
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

            await interaction.reply({
                content: `Đã báo cáo từ **${word}**`,
                ephemeral: true
            })

            const acceptButton = new ButtonBuilder()
                .setCustomId('accept')
                .setLabel('Đồng ý')
                .setStyle(ButtonStyle.Success)

            const declineButton = new ButtonBuilder()
                .setCustomId('decline')
                .setLabel('Từ chối')
                .setStyle(ButtonStyle.Danger)

            const row = new ActionRowBuilder()
                .addComponents(acceptButton, declineButton)
            
            const wordData = {
                word,
                reason,
                user: interaction.user.username,
                guildName: interaction.guild.name,
                guildId: interaction.guildId,
                guildIcon: interaction.guild.iconURL({ dynamic: true })
            }

            const msg = await client.channels.cache.get(REPORT_CHANNEL).send({
                embeds: [reportEmbed(wordData)],
                components: [row]
            })

            const filter = i => i.customId === 'accept' || i.customId === 'decline'

            const collection = msg.createMessageComponentCollector({filter})

            collection.on('collect', async i => {

                if (!i.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                    return i.reply({
                        content: 'Bạn không có quyền này',
                        ephemeral: true
                    })
                }
        
                let status
        
                if (i.customId === 'accept') {
                    status = 1
                } else {
                    status = 2
                }

                await msg.edit({
                    embeds: [reportEmbed(wordData, status)],
                    components: []
                })
                return
            })

        }

    }
}