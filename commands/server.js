const { SlashCommandBuilder, EmbedBuilder, Client, InteractionCollector } = require('discord.js')
const fs = require('fs')
const path = require('path')

/**
 * 
 * @param {InteractionCollector} interaction 
 * @param {Client} client
 * @returns 
 */
const serverEmbed = async (interaction, client) => {
    const guild = interaction.member.guild
    const owner = await guild.fetchOwner()
    return new EmbedBuilder()
        .setColor(13250094)
        //.setTitle(guild.name)
        .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL({ dynamic: true })
        })
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
            {
                name: 'ID Server',
                value: interaction.guildId,
                inline: true,
            },
            {
                name: 'Thành lập',
                value: `<t:${Math.floor(Date.parse(guild.createdAt) / 1000)}:R>`,
                inline: true,
            },
            {
                name: 'Owner',
                value: `<@${guild.ownerId}>`,
                inline: true,
            },
            {
                name: 'Ngày thêm Bot',
                value: `<t:${Math.floor(Date.parse(guild.joinedAt) / 1000)}:R>`,
                inline: true
            },
            {
                name: 'Premium',
                value: ':white_check_mark: Đã kích hoạt',
                inline: true
            }
        )

}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Xem thông tin máy chủ'),

        async execute (interaction, client) {
            console.log(interaction.member.guild)
            await interaction.reply({
                embeds: [await serverEmbed(interaction, client)]
            })
        }
}