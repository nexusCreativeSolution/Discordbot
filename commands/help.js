const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Provides a list of available commands and sends an image.',
    async execute(message) {
        // Get the commands from the client
        const commands = message.client.commands;

        // Create a styled command list with bullets and a clear layout
        let commandsList = '';
        commandsList += '**📜 Available Commands:**\n\n';

        commands.forEach(command => {
            commandsList += `**${command.name}**: ${command.description || 'No description available.'}\n`;
        });

        // URL of the help image
        const imageUrl = 'https://telegra.ph/file/651c89a43ed0b07f0b955.jpg';

        // Create an embed with the image at the top and commands list below
        const embed = new EmbedBuilder()
            .setTitle('Help Command')
            .setImage(imageUrl)
            .setDescription(commandsList)
            .setColor('#0099ff') // Choose a color for the embed
            .setFooter({ text: '©️ Nexus Inc.' })
            .setTimestamp(); // Add a timestamp for added professionalism

        // Send the embed
        await message.channel.send({ embeds: [embed] });
    },
};
