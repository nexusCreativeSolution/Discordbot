const ShopItem = require('../models/shopItem');

module.exports = {
    name: 'shop',
    description: 'View available items for purchase.',
    async execute(message) {
        try {
            const items = await ShopItem.find();
            let shopMessage = '**🛒 Welcome to the Nexus Inc. Shop!**\n\n';
            
            if (items.length === 0) {
                shopMessage += 'No items are available for purchase at the moment.';
            } else {
                items.forEach(item => {
                    shopMessage += `**────────────────────────**\n` +
                                   `**🎁 Item:** ${item.name}\n` +
                                   `**💵 Price:** $${item.price}\n` +
                                   `**📜 Description:** _${item.description}_\n` +
                                   `**────────────────────────**\n`;
                });
            }

            message.channel.send(shopMessage);
        } catch (error) {
            console.error('Error fetching shop items:', error);
            message.reply('There was an error displaying the shop.');
        }
    },
};
