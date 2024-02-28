const fs = require('fs')
const { Client, Collection } = require('discord.js')
require('dotenv').config()
const client = new Client({
  // The intents will depend on what you want to do with the robot, 
  // but don't forget to activate them in your discord.dev dashboard
  // at the address https://discord.com/developers/applications/{ID}/bot, 
  // section "Privileged Gateway Intents"
  intents: 3241725
})

// We create a collection for commands
client.commands = new Collection()
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  client.commands.set(command.data.name, command)
}

// Events like ready.js (when the robot turns on), 
// or messageCreate.js (when a user/robot sends a message)
const eventFiles = fs
  .readdirSync('./events')
  .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
  const event = require(`./events/${file}`)
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client))
  } else {
    client.on(event.name, (...args) => event.execute(...args, client))
  }
}

// The interactionCreate event directly here, as this is the heart of the robot.
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return
  const command = client.commands.get(interaction.commandName)
  if (!command) return

  // We log when a user makes a command
  try {
    await console.log(
      `/${interaction.commandName} — Par ${interaction.user.username}`
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
})

// The token of your robot to be inserted
client.login(process.env.BOT_TOKEN)