import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import prisma from '../database/prisma.js'

/**
 * @returns {Promise<string[]>} Premium guild ID list.
 */
const getPremiumList = async () => {
    const guilds = await prisma.guild.findMany({
        where: { isPremium: true },
        select: { id: true }
    })
    return guilds.map(g => g.id)
}

/**
 * @param {import('discord.js').CommandInteraction} interaction
 * @param {import('discord.js').Client} client
 * @returns {Promise<EmbedBuilder>}
 */
const serverEmbed = async (interaction, client) => {
    const guild = interaction.member.guild
    const owner = await guild.fetchOwner()
    const pList = await getPremiumList()

    return new EmbedBuilder()
        .setColor(13250094)
        .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL({ dynamic: true })
        })
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
            {
                name: ':id: ID Server',
                value: interaction.guildId,
                inline: true,
            },
            {
                name: ':calendar: Thành lập',
                value: `<t:${Math.floor(Date.parse(guild.createdAt) / 1000)}:R>`,
                inline: true,
            },
            {
                name: ':crown: Owner',
                value: `<@${guild.ownerId}>`,
                inline: true,
            },
            {
                name: ':robot: Ngày thêm Bot',
                value: `<t:${Math.floor(Date.parse(guild.joinedAt) / 1000)}:R>`,
                inline: true
            },
            {
                name: ':star: PhoBo Premium',
                value: (pList.includes(interaction.guildId)) ? ':white_check_mark: Đã kích hoạt' : ':closed_lock_with_key: Chưa kích hoạt',
                inline: true
            }
        )

}

export default {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Xem thông tin máy chủ'),

    async execute (interaction, client) {
        await interaction.reply({
            embeds: [await serverEmbed(interaction, client)]
        })
    }
}
