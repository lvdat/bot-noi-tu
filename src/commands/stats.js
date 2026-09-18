import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import prisma from '../database/prisma.js'
import { countWords } from '../game/dictionary.js'

async function getStats(client) {
    let playerCount = 0

    // Count total players across all guilds
    playerCount = await prisma.player.count()

    // Get bot global stats
    const botStats = await prisma.botStats.findUnique({
        where: { id: 'global' }
    })

    return {
        queryNumber: botStats?.totalQueries?.toString() ?? '0',
        playerCount,
        wordsPlayed: botStats?.wordsPlayed?.toString() ?? '0',
        roundsPlayed: botStats?.roundsPlayed?.toString() ?? '0'
    }
}

const statEmbed = async (client) => {
    const { queryNumber, playerCount, wordsPlayed, roundsPlayed } = await getStats(client)
    const wordCount = await countWords()

    return new EmbedBuilder()
    .setColor(13250094)
    .addFields(
        {
            name: 'Tổng số server đang sử dụng',
            value: `${client.guilds.cache.size} servers`,
            inline: true
        },
        {
            name: 'Tổng số người đã chơi',
            value: `${playerCount}`,
            inline: true
        },
        {
            name: 'Tổng số từ đã nối',
            value: `${wordsPlayed}`,
            inline: true
        },
        {
            name: 'Tổng số vòng đã diễn ra',
            value: `${roundsPlayed}`,
            inline: true
        },
        {
            name: 'Tổng số truy vấn dữ liệu',
            value: `${queryNumber}`,
            inline: true
        },
        {
            name: 'Tổng số từ trong ngân hàng từ',
            value: `${wordCount}`,
            inline: true
        },
    )
}

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Xem các thống kê của BOT'),

    async execute(interaction, client) {
        await interaction.deferReply()
        await interaction.editReply({
            embeds: [await statEmbed(client)],
            flags: [4096]
        })
    }
}
