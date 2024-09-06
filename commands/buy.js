// buy.js
const Inventory = require('../models/inventory');
const shopItem = require('../models/shopItem');
const Economy = require('../models/economy');

module.exports = {
    name: 'buy',
    description: 'Buy an item from the shop.',
    args: true,
    usage: '<item_name>',
    async execute(message, args) {
        try {
            const userId = message.author.id;
            const itemName = args.join(' ');

            // Find the item in the shop
            const item = await shopItem.findOne({ name: itemName });
            if (!item) {
                return message.reply('That item does not exist in the shop.');
            }

            // Fetch the user's economy data
            let economyData = await Economy.findOne({ userId });
            if (!economyData || economyData.balance < item.price) {
                return message.reply('You do not have enough money to buy this item.');
            }

            // Deduct the item price from user's balance
            economyData.balance -= item.price;
            await economyData.save();

            // Fetch the user's inventory
            let inventoryData = await Inventory.findOne({ userId });

            // If user doesn't have an inventory, create one
            if (!inventoryData) {
                inventoryData = new Inventory({ userId, items: [] });
            }

            // Check if the item already exists in the user's inventory
            const itemIndex = inventoryData.items.findIndex(i => i.name === itemName);
            if (itemIndex > -1) {
                // If the item exists, increment the quantity
                inventoryData.items[itemIndex].quantity += 1;
            } else {
                // If the item doesn't exist, add it to the inventory
                inventoryData.items.push({ name: itemName, quantity: 1 });
            }

            // Save the updated inventory
            await inventoryData.save();

            message.reply(`You have successfully purchased ${itemName} for $${item.price}.`);

        } catch (error) {
            console.error('Error processing purchase:', error);
            message.reply('There was an error processing your purchase.');
        }
    },
};
