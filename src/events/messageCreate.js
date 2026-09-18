import { PermissionsBitField } from 'discord.js'
import { PREFIX, START_COMMAND, STOP_COMMAND } from '../config.js'
import { getConfiguredChannel, setChannel, ensureGuild, startGame, stopGame, processWord, incrementStats } from '../game/engine.js'
import { sendMessageToChannel } from '../utils/message.js'
import prisma from '../database/prisma.js'

export default {
    name: 'messageCreate',
    once: false,
    async execute(message, client) {
        if (message.author.bot) return // Ignore messages from bots

        const guild = message.guild
        if (!guild) return // Ignore DMs

        const channel = message.channel

        // Get configured channel for this guild
        const configChannel = await getConfiguredChannel(guild.id)
        if (!configChannel) {
            // No channel configured — only handle prefix commands
            if (message.content.startsWith(PREFIX)) {
                const arg = message.content.trim().split(/\s+/).filter(Boolean)[1]
                console.log(`[${guild.name}][${channel.name}] ${message.author.displayName} used prefix command [${arg ? arg : 'no action'}]`)
                if (arg === 'set') {
                    if (!message.member.permissionsIn(channel).has(PermissionsBitField.Flags.ManageGuild)) {
                        return message.reply({
                            content: 'Bạn cần có quyền `MANAGE_GUILD` để dùng lệnh này'
                        })
                    } else {
                        await setChannel(guild.id, channel.id)
                        return message.reply({
                            content: `Bạn đã chọn kênh **${channel.name}** làm kênh nối từ của máy chủ **${guild.name}**. Dùng \`!start\` để bắt đầu trò chơi`
                        })
                    }
                }
            }
            return
        }

        // Handle prefix commands even in configured channels
        if (message.content.startsWith(PREFIX)) {
            const arg = message.content.trim().split(/\s+/).filter(Boolean)[1]
            console.log(`[${guild.name}][${channel.name}] ${message.author.displayName} used prefix command [${arg ? arg : 'no action'}]`)
            if (arg === 'set') {
                if (!message.member.permissionsIn(configChannel).has(PermissionsBitField.Flags.ManageGuild)) {
                    return message.reply({
                        content: 'Bạn cần có quyền `MANAGE_GUILD` để dùng lệnh này',
                        ephemeral: true
                    })
                } else {
                    await setChannel(guild.id, channel.id)
                    return message.reply({
                        content: `Bạn đã chọn kênh **${channel.name}** làm kênh nối từ của máy chủ **${guild.name}**. Dùng \`!start\` để bắt đầu trò chơi`,
                        ephemeral: true
                    })
                }
            }
        }

        // Only process game messages in the configured channel
        if (channel.id !== configChannel) return

        // Ensure guild exists in database
        await ensureGuild(guild.id)

        // Handle !start command
        if (message.content === START_COMMAND) {
            // Check if a game is already running
            const session = await prisma.gameSession.findFirst({
                where: { channelId: configChannel, isRunning: true }
            })

            if (!session) {
                sendMessageToChannel(client, configChannel, `Trò chơi đã bắt đầu!`)
                await startGame(client, guild.id, configChannel)
            } else {
                sendMessageToChannel(client, configChannel, 'Trò chơi vẫn đang tiếp tục. Bạn có thể dùng `!stop`')
            }
            return
        }

        // Handle !stop command
        if (message.content === STOP_COMMAND) {
            if (!message.member.permissionsIn(configChannel).has(PermissionsBitField.Flags.ManageChannels)) {
                message.reply({
                    content: 'Bạn không có quyền dùng lệnh này'
                })
                return
            }

            const session = await prisma.gameSession.findFirst({
                where: { channelId: configChannel, isRunning: true }
            })

            if (session) {
                sendMessageToChannel(client, configChannel, `Đã kết thúc lượt này! Lượt mới đã bắt đầu!`)
                await stopGame(configChannel)
                await incrementStats({ roundsPlayed: 1 })
                await startGame(client, guild.id, configChannel)
            } else {
                sendMessageToChannel(client, configChannel, 'Trò chơi chưa bắt đầu. Bạn có thể dùng `!start`')
            }
            return
        }

        // Process word submission (game logic)
        await processWord(message, client)
    }
}
