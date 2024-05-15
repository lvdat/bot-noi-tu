const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fs = require('fs')
const path = require('path')

const rankingPath = path.resolve(__dirname, '../data/ranking.json')

/**
 * 
 * @param {Number} userId 
 * @param {Number} guildId 
 * @returns {Object}
 */
const getDataOfUser = (userId, guildId) => {
    const rankData = require(rankingPath)
    if (rankData[guildId] === undefined) {
        console.log('1')
        return {}
    } else {
        if (rankData[guildId].players.length === 0) {
            console.log('2')
            return {}
        } else {
            for (let i = 0; i < rankData[guildId].players.length; i++) {
                if (rankData[guildId].players[i].id === userId) {
                    return rankData[guildId].players[i]
                }
            }
        return {}
        }
    }
}

const embedData = (userId, guildId) => {
    const dataUser = getDataOfUser(userId, guildId)
    console.log(dataUser)
    if (dataUser == {}) {
        return [{
            name: '',
            value: 'Bạn chưa chơi nối từ ở server này!'
        }]
    } else {
        return [
            {
                name: 'Thắng',
                value: '`' + dataUser.win + '`',
                inline: true
            },
            {
                name: 'Đã trả lời đúng',
                value: '`' + dataUser.true + '/' + dataUser.total + ' từ (' + (dataUser.true/dataUser.total*100).toFixed(2) + '%)`',
                inline: true
            },
        ]
    }
}

const meEmbed = (interaction) => new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle(interaction.member.displayName)
    .setDescription('Hồ sơ nối từ')
    .setThumbnail(interaction.member.user.avatarURL())
    .addFields(embedData(interaction.member.user.id, interaction.member.guild.id))

module.exports = {
    data: new SlashCommandBuilder()
        .setName('me')
        .setDescription('Xem thống kê nối từ của bạn'),

        async execute(interaction, client) {
            //console.log(interaction.member)
            await interaction.reply({
                embeds: [meEmbed(interaction)]
            })
        }
}