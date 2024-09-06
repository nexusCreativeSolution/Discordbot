const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Replies with a pong message and the bot’s latency.',
    async execute(message, args) {
        // Send an initial message to measure the latency
        const sentMessage = await message.channel.send('Pinging...');

        // Calculate the latency
        const latency = sentMessage.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);

        // Create an embed to format the response
        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .setDescription('Here is the latency information:')
            .addFields(
                { name: 'Bot Latency', value: `${latency}ms`, inline: true },
                { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
            )
            .setColor('#0099ff') // Choose a color for the embed
            .setFooter({ text: '©️ Nexus Inc.' })
            .setTimestamp(); // Add a timestamp for added professionalism

        // Edit the initial message with the embed
        await sentMessage.edit({ content: null, embeds: [embed] });
    },
};
