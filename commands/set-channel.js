const { SlashCommandBuilder, ChannelType } = require('discord.js');
const fs = require('fs')
const dataChannel = require('../data/data.json')
const path = require('path')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-channel')
        .setDescription('Cài đặt kênh chơi nối từ')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Kênh chơi nối từ')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)),
    async execute (interaction) {
        if(!interaction.member.permissions.has('ADMINISTRATOR')) {
            await interaction.reply({
                content: 'Bạn cần có quyền Admin để thực hiện thao tác này!',
                ephemeral: true
            })
        } else {
            let guild = interaction.member.guild
            let channel = interaction.options.getChannel('channel')

            // check send permission for bot
            if (!interaction.member.permissionsIn(channel).has('VIEW_CHANNEL')) {
                await interaction.reply({
                    content: 'Tôi không có quyền xem kênh này!',
                    ephemeral: true
                })
                return
            }

            if (!interaction.member.permissionsIn(channel).has('SEND_MESSAGES')) {
                await interaction.reply({
                    content: 'Tôi không có quyền gửi tin nhắn ở kênh này!',
                    ephemeral: true
                })
                return
            }

            if (!interaction.member.permissionsIn(channel).has('ADD_REACTIONS')) {
                await interaction.reply({
                    content: 'Tôi không có quyền thả cảm xúc vào tin nhắn ở kênh này!',
                    ephemeral: true
                })
                return
            }

            dataChannel[interaction.guildId] = {
                channel: channel.id
            }

            fs.writeFileSync(path.resolve(__dirname, '../data/data.json'), JSON.stringify(dataChannel))

            await interaction.reply({
                content: `Bạn đã chọn kênh **${channel.name}** làm kênh chơi nối từ của máy chủ **${interaction.member.guild.name}**!`
            })

            return
        }
    }
}