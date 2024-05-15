const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('fs')
const path = require('path')

const rankingPath = path.resolve(__dirname, '../data/ranking.json')

/**
 * 
 * @param {Number} guildId 
 * @returns {Array}
 */
const getRankOfServer = (guildId) => {
    const rankData = require(rankingPath)
    if (rankData[guildId] === undefined) {
        return []
    } else {
        return rankData[guildId].players.length === 0 ? [] : rankData[guildId].players.sort((a, b) => b.win - a.win)
    }
}

const embedData = (guildId) => {
    const rankOfServer = getRankOfServer(guildId)
    
}

const rankEmbed = (interaction, client, rankData) => new EmbedBuilder()
    .setColor(13250094)
    .setAuthor({
        name: `BXH nối từ của ${interaction.member.guild.name}`,
        iconURL: interaction.member.guild.iconURL({ dynamic: true })
    })
    .addFields(
        {
            name: 'Top 10',
            value: '`1` Dont ask me why\n`2` Dont ask me why',
            inline: true
        },
        {
            name: 'Thắng',
            value: '`100`\n`100`',
            inline: true
        },
        {
            name: 'Từ đúng',
            value: '`100/500 (20%)`\n`100/500 (20%)`',
            inline: true
        }
    )

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Xem bảng xếp hạng nối từ'),

        async execute(interaction, client) {
            const rankData = require(rankingPath)
            console.log(interaction)
            await interaction.reply({
                embeds: [rankEmbed(interaction, client, rankData)]
            })
        }
}