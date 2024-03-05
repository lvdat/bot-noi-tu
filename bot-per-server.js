const fs = require('fs')
const path = require('path')
const { Client, GatewayIntentBits } = require('discord.js')
const dictionary = require('@vntk/dictionary')
require('dotenv').config()
const dataChannel = require('./data/data.json')
const wordDataChannel = require('./data/word-data.json')

const wordDataPath = path.resolve(__dirname, './data/word-data.json')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

// load word data
const dicData = dictionary.lower_words

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

// function

const sendMessageToChannel = (msg, channel_id) => {
    client.channels.cache.get(channel_id).send(msg)
}

const checkIfHaveAnswerInDb = (word) => {
    let w = word.split(/ +/)
    let lc = w[w.length - 1]
    for (let i = 0; i < dicData.length; i++) {
        let tempw = dicData[i].split(/ +/)
        if (tempw.length > 1 && tempw[0] === lc && !isWordExist(dicData[i])) {
            // detect word
            queryCount += i
            return true
        }
    }
    return false
}

// end function

// LOGIC GAME

client.on('messageCreate', async message => {
    if(message.author.bot) return // detect mess from BOT

    let guild = message.guild
    let channel = message.channel

    if(dataChannel[guild.id] !== undefined && dataChannel[guild.id].channel !== undefined) {
        // detect channel not config
        return
    }

    

})

// END LOGIC GAME

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