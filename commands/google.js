const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'google',
    description: 'Search Google for your query and get a direct link.',
    args: true,
    usage: '<search query>',
    execute(message, args) {
        // Ensure the user provided a search query
        if (!args.length) {
            return message.reply('Please provide a search query.');
        }

        // Join the user's arguments into a search string
        const searchQuery = args.join(' ');

        // Encode the search query to make it URL-friendly
        const encodedQuery = encodeURIComponent(searchQuery);

        // Create the Google search link
        const googleUrl = `https://www.google.com/search?q=${encodedQuery}`;

        // Create an embedded message
        const embed = new EmbedBuilder()
            .setColor('#4285F4') // Google's blue color
            .setTitle('🔍 Google Search')
            .setDescription(`Here are the search results for: **${searchQuery}**`)
            .addFields({ name: 'Search Link', value: `[Click here to view results](${googleUrl})` })
            .setFooter({ text: 'Powered by Google', iconURL: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_92x30dp.png' });

        // Send the embedded message
        message.reply({ embeds: [embed] });
    },
};
