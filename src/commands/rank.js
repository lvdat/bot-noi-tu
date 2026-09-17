import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import prisma from '../database/prisma.js'

/**
 * Gets the top players for a guild, sorted by wins then accuracy.
 * @param {string} guildId
 * @returns {Promise<Array>}
 */
const getRankOfServer = async (guildId) => {
    const players = await prisma.player.findMany({
        where: { guildId },
        orderBy: [
            { wins: 'desc' },
            { correctWords: 'desc' }
        ]
    })

    // Secondary sort by accuracy (can't do computed fields in Prisma orderBy)
    return players.sort((a, b) => {
        if (b.wins !== a.wins) {
            return b.wins - a.wins
        }
        const aAccuracy = a.totalAttempts === 0 ? 0 : a.correctWords / a.totalAttempts
        const bAccuracy = b.totalAttempts === 0 ? 0 : b.correctWords / b.totalAttempts
        if (bAccuracy !== aAccuracy) {
            return bAccuracy - aAccuracy
        }
        return b.correctWords - a.correctWords
    })
}

/**
 * Builds embed fields for ranking display.
 * @param {string} guildId
 * @returns {Promise<Array>}
 */
const embedData = async (guildId) => {
    const rankOfServer = await getRankOfServer(guildId)
    let embedd = [
        {
            name: 'Top 10',
            value: '',
            inline: true
        },
        {
            name: 'Win',
            value: '',
            inline: true
        },
        {
            name: 'Từ đúng',
            value: '',
            inline: true
        }
    ]

    if(rankOfServer.length === 0) {
        return [{
            name: 'Top 10',
            value: 'Chưa có ai chơi nối từ ở server này.'
        }]
    } else {
        for (let i = 0; i < rankOfServer.length; i++) {
            const accuracy = rankOfServer[i].totalAttempts > 0
                ? (rankOfServer[i].correctWords / rankOfServer[i].totalAttempts * 100).toFixed(2)
                : '0.00'
            embedd[0].value += ('`' + (i + 1) + '` ' + rankOfServer[i].name + '\n')
            embedd[1].value += ('`' + rankOfServer[i].wins + '`\n')
            embedd[2].value += ('`' + rankOfServer[i].correctWords + '/' + rankOfServer[i].totalAttempts + ' (' + accuracy + '%)`\n')
            if (i == 9) break
        }
        return embedd
    }
}

const rankEmbed = async (interaction) => new EmbedBuilder()
    .setColor(13250094)
    .setAuthor({
        name: `BXH nối từ của ${interaction.member.guild.name}`,
        iconURL: interaction.member.guild.iconURL({ dynamic: true })
    })
    .addFields(await embedData(interaction.member.guild.id))

export default {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Xem bảng xếp hạng nối từ'),

    async execute(interaction, client) {
        await interaction.reply({
            embeds: [await rankEmbed(interaction)]
        })
    }
}
