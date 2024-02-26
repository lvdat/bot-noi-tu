const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config()
const { generateDependencyReport } = require('@discordjs/voice');

console.log(generateDependencyReport());

const TOKEN = process.env.BOT_TOKEN
const client = new Client({ 
    intents: 3241725 // xD full intents ??
}); // prepare client

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(
        'Nối từ',
        {
            type: ActivityType.Playing
        }
    );
    client.user.setStatus('idle')
});

// client.on('interactionCreate', async interaction => {
//     if (!interaction.isChatInputCommand()) return;

//     if (interaction.commandName === 'minevui') {
//         await interaction.replied('Server đang sửa, hỏi cc')
//     }
// })

client.commands = new Collection()

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log('Added slash command: ' + command.data.name)
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => { // Listeing to the voiceStateUpdate event
    if (newVoiceState.channel) { // The member connected to a channel.
        console.log(`${newVoiceState.member.user.tag} connected to ${newVoiceState.channel.name}.`);
    } else if (oldVoiceState.channel) { // The member disconnected from a channel.
        console.log(`${oldVoiceState.member.user.tag} disconnected from ${oldVoiceState.channel.name}.`)
    };
});

client.login(TOKEN) // connect to Discord