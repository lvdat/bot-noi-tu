import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import prisma from '../database/prisma.js'

/**
 * Gets player data for a specific user in a guild.
 * @param {string} userId
 * @param {string} guildId
 * @returns {Promise<object|null>}
 */
const getDataOfUser = async (userId, guildId) => {
    return await prisma.player.findUnique({
        where: { guildId_userId: { guildId, userId } }
    })
}

const embedData = async (userId, guildId) => {
    const dataUser = await getDataOfUser(userId, guildId)

    if (!dataUser) {
        return [{
            name: '',
            value: 'Bạn chưa chơi nối từ ở server này!'
        }]
    } else {
        const accuracy = dataUser.totalAttempts > 0
            ? (dataUser.correctWords / dataUser.totalAttempts * 100).toFixed(2)
            : '0.00'
        return [
            {
                name: 'Thắng',
                value: '`' + dataUser.wins + '`',
                inline: true
            },
            {
                name: 'Đã trả lời đúng',
                value: '`' + dataUser.correctWords + '/' + dataUser.totalAttempts + ' từ (' + accuracy + '%)`',
                inline: true
            },
        ]
    }
}

const meEmbed = async (interaction) => {
    const fields = await embedData(interaction.member.user.id, interaction.member.guild.id)
    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(interaction.member.displayName)
        .setDescription('Hồ sơ nối từ')
        .setThumbnail(interaction.member.user.avatarURL())
        .addFields(fields)
}

export default {
    data: new SlashCommandBuilder()
        .setName('me')
        .setDescription('Xem thống kê nối từ của bạn'),

    async execute(interaction, client) {
        await interaction.deferReply()
        await interaction.editReply({
            embeds: [await meEmbed(interaction)]
        })
    }
}
