import { MessageFlags } from 'discord.js'

export default {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        if (!interaction.isCommand()) return
        const command = client.commands.get(interaction.commandName)
        if (!command) return

        try {
            console.log(
                `[${interaction.guild.name}] ${interaction.user.username} used /${interaction.commandName}`
            )
            await command.execute(interaction, client)
        } catch (error) {
            console.error(error)
            try {
                const errorPayload = {
                    content: "An error occurred while executing this command!",
                    flags: [MessageFlags.Ephemeral]
                }
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply(errorPayload)
                } else {
                    await interaction.reply(errorPayload)
                }
            } catch (replyError) {
                // Interaction expired or already handled, nothing we can do
                console.error('[ERROR] Could not send error reply:', replyError.message)
            }
        }
    }
}
