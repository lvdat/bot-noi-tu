import { AUTO_DELETE_SECONDS } from '../config.js'

/**
 * Sends a silent message to a specific channel.
 * @param {import('discord.js').Client} client - Discord client
 * @param {string} channelId - Target channel ID
 * @param {string} msg - Message content
 */
export function sendMessageToChannel(client, channelId, msg) {
  const channel = client.channels.cache.get(channelId)
  if (channel) {
    channel.send({
      content: msg,
      flags: [4096]
    })
  }
}

/**
 * Sends a message that auto-deletes after a specified number of seconds.
 * @param {import('discord.js').Client} client - Discord client
 * @param {string} channelId - Target channel ID
 * @param {string} msg - Message content
 * @param {number} [seconds] - Seconds before auto-delete
 */
export function sendAutoDeleteMessage(client, channelId, msg, seconds = AUTO_DELETE_SECONDS) {
  const channel = client.channels.cache.get(channelId)
  if (channel) {
    channel.send({
      content: msg,
      flags: [4096]
    }).then(mess => setTimeout(() => mess.delete().catch(() => {}), 1000 * seconds))
  }
}
