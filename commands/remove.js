// remove.js
const shopItem = require('../models/shopItem');

module.exports = {
    name: 'remove',
    description: 'Remove an item from the shop.',
    args: true,
    usage: '<item_name>',
    async execute(message, args) {
        if (!message.member.permissions.has('MANAGE_GUILD')) {
            return message.reply('You do not have permission to use this command.');
        }

        const itemName = args.join(' ');

        try {
            // Find the item in the shop
            const item = await shopItem.findOne({ name: itemName });
            if (!item) {
                return message.reply('That item does not exist in the shop.');
            }

            // Remove the item from the shop
            await shopItem.deleteOne({ name: itemName });

            message.reply(`${itemName} has been removed from the shop.`);
        } catch (error) {
            console.error('Error removing item:', error);
            message.reply('There was an error removing the item.');
        }
    },
};
