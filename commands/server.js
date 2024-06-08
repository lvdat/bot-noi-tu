const { SlashCommandBuilder, EmbedBuilder, Client, InteractionCollector } = require('discord.js')
const fs = require('fs')
const path = require('path')

const premiumGuildsPath = path.resolve(__dirname, '../data/premium-guilds.txt')

/**
 * 
 * @returns {Array} Premium guild list.
 */
const getPremiumList = () => {
    let premiumList = []
    try {
        const premiumData = fs.readFileSync(premiumGuildsPath, 'utf-8')
        const cleanedPremiumData = premiumData.replace('/\r/g', '').split('\n')
        premiumList = cleanedPremiumData
            .filter(line => line.trim() !== '')
            .map(line => Number(line.trim()))
    } catch (err) {
        console.log('Error when fetch premium list, err: ' + err)
    }
    return premiumList
}

/**
 * 
 * @param {InteractionCollector} interaction 
 * @param {Client} client
 * @returns 
 */
const serverEmbed = async (interaction, client) => {
    const guild = interaction.member.guild
    const owner = await guild.fetchOwner()
    const pList = getPremiumList()
    console.log(pList)
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
                value: (pList.includes(Number(interaction.guildId))) ? ':white_check_mark: Đã kích hoạt' : ':closed_lock_with_key: Chưa kích hoạt',
                inline: true
            }
        )

}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Xem thông tin máy chủ'),

        async execute (interaction, client) {
            await interaction.reply({
                embeds: [await serverEmbed(interaction, client)]
            })
        }
}