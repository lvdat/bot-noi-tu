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

/**
 * 
 * @param {Number} guildId 
 * @returns {Array}
 */
const embedData = (guildId) => {
    const rankOfServer = getRankOfServer(guildId)
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
            embedd[0].value += ('`' + (i + 1) + '` ' + rankOfServer[i].name + '\n')
            embedd[1].value += ('`' + rankOfServer[i].win + '`\n')
            embedd[2].value += ('`' + rankOfServer[i].true + '/' + rankOfServer[i].total + ' (' + (rankOfServer[i].true/rankOfServer[i].total*100).toFixed(2) + '%)`\n')
            if (i == 9) break
        }
        return embedd
    }
    
}

const rankEmbed = (interaction, client, rankData) => new EmbedBuilder()
    .setColor(13250094)
    .setAuthor({
        name: `BXH nối từ của ${interaction.member.guild.name}`,
        iconURL: interaction.member.guild.iconURL({ dynamic: true })
    })
    .addFields(embedData(interaction.member.guild.id))

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Xem bảng xếp hạng nối từ'),

        async execute(interaction, client) {
            const rankData = require(rankingPath)
            await interaction.reply({
                embeds: [rankEmbed(interaction, client, rankData)]
            })
        }
}