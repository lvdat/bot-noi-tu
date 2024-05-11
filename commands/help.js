const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

const helpEmbed = () => new EmbedBuilder()
    .setColor(13250094)
    .addFields(
        {
            name: 'Cài đặt kênh chơi nối từ',
            value: 'Dùng lệnh slash `/set-channel <channel>`'
        },
        {
            name: 'Bắt đầu lượt chơi',
            value: 'Dùng lệnh `!start` trong kênh chơi nối từ'
        },
        {
            name: 'Dừng lượt chơi',
            value: 'Dùng lệnh `!stop` trong kênh chơi nối từ, khi `stop` thì lượt mới sẽ tự động bắt đầu!'
        },
        {
            name: 'Xem thống kê của BOT',
            value: 'Dùng lệnh slash `/stats`'
        },
        {
            name: 'Ai có thể dùng lệnh set-channel?',
            value: 'Người dùng có quyền **MANAGE_CHANNELS**'
        },
        {
            name: 'Ai có thể dùng lệnh !start',
            value: 'Người dùng có quyền xem và gửi tin nhắn vào kênh nối từ'
        },
        {
            name: 'Ai có thể dùng lệnh !stop',
            value: 'Người dùng có quyền **MANAGE_CHANNELS**'
        },
        {
            name: 'Khi nào trò chơi kết thúc',
            value: 'Khi không còn từ nào trong từ điển Tiếng Việt có thể nối tiếp từ hiện tại hoặc Admin dùng lệnh !stop'
        },
        {
            name: 'Mã nguồn trò chơi',
            value: '[github.com/lvdat/bot-noi-tu](https://github.com/lvdat/bot-noi-tu)'
        }
    )

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Xem hướng dẫn sử dụng BOT'),
    async execute(interaction) {
        await interaction.reply({
            embeds: [helpEmbed()],
            flags: [4096]
        })
    }
}