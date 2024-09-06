// inventory.js
const Inventory = require('../models/inventory');

module.exports = {
    name: 'inventory',
    description: 'View your inventory.',
    async execute(message) {
        try {
            const userId = message.author.id;

            // Fetch user's inventory from the database
            let inventoryData = await Inventory.findOne({ userId });

            if (!inventoryData || inventoryData.items.length === 0) {
                return message.reply('Your inventory is empty.');
            }

            // Format the inventory for display
            let inventoryList = inventoryData.items.map(item => 
                `${item.name} (x${item.quantity})`
            ).join('\n');

            message.reply(`
📦 **Inventory**
${inventoryList}
            `);

        } catch (error) {
            console.error('Error fetching inventory:', error);
            message.reply('There was an error fetching your inventory.');
        }
    }
};
