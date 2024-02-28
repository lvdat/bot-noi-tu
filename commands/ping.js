const { EmbedBuilder } = require('discord.js')
module.exports = {
  // "data" is the body of the command,
  // this is what we will find when we type /ping
  data: {
    name: 'ping',
    description: 'Get the ping from the robot',
    options: []
  },
  // and all this is the logic of the order
  async execute(interaction, client) {
    // For example here we create an embed with EmbedBuilder from discord.js
    // We add a name and iconURL to it, and then modify it with the values.
    const PingBeforeEmbed = new EmbedBuilder().setAuthor({
      name: `The bird will come back with the bot ping...`,
      iconURL: client.user.avatarURL()
    })
    const sent = await interaction.reply({
      embeds: [PingBeforeEmbed],
      fetchReply: true,
      ephemeral: true
    })
    const TotalPing = sent.createdTimestamp - interaction.createdTimestamp
    const PingEmbed = new EmbedBuilder()
      .setAuthor({
        name: `Ping of ${client.user.username}`,
        iconURL: client.user.avatarURL()
      })
      .addFields(
        {
          name: 'Total ping',
          value: `${TotalPing}ms`,
          inline: true
        },
        {
          name: 'Websocket',
          value: `${client.ws.ping} ms`,
          inline: true
        }
      )
    await interaction.editReply({
      embeds: [PingEmbed],
      ephemeral: true
    })
  }
}