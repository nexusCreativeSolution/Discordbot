const { EmbedBuilder } = require('discord.js');
const Inventory = require('../models/inventory');

module.exports = {
    name: 'inventory',
    description: 'Check your inventory.',
    args: false,
    async execute(message) {
        try {
            // Fetch user's inventory and populate item details
            let userInventory = await Inventory.findOne({ userId: message.author.id }).populate('items');

            // Check if the user has any items
            if (!userInventory || !userInventory.items.length) {
                return message.reply('🛍️ **Your inventory is currently empty.**');
            }

            // Prepare a list of item names with lines between sections
            const itemsList = userInventory.items.map(item => `• **${item.name}**\n`).join('\n──────────\n');

            // Create the embed
            const embed = new EmbedBuilder()
                .setColor('#00FF00') // Customize the color
                .setTitle('📦 Your Inventory')
                .setDescription(`${itemsList}`)
                .setFooter({ text: '©️ Nexus Inc' }) // Removed iconURL for now
                .setTimestamp(); // Adds a timestamp to the footer

            // Send the embed
            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching inventory:', error);
            message.reply('🚨 There was an error fetching your inventory. Please try again later.');
        }
    },
};
