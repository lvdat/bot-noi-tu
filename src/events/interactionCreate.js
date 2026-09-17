export default {
    name: 'interactionCreate',
    once: false,
    async execute(interaction, client) {
        if (!interaction.isCommand()) return
        const command = client.commands.get(interaction.commandName)
        if (!command) return

        // We log when a user makes a command
        try {
            console.log(
                `[${interaction.guild.name}] ${interaction.user.username} used /${interaction.commandName}`
            )
            await command.execute(interaction, client)
            // But if there is a mistake,
            // then we log that and send an error message only to the person (ephemeral: true)
        } catch (error) {
            console.error(error)
            return interaction.reply({
                content: "An error occurred while executing this command!",
                ephemeral: true,
                fetchReply: true
            })
        }
    }
}
