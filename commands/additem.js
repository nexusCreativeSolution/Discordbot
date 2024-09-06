const ShopItem = require('../models/shopItem');

module.exports = {
    name: 'additem',
    description: 'Add a new item to the shop. (Admin only)',
    args: true,
    usage: '<item_name> <price> <description>',
    async execute(message, args) {
        // Ensure the user has the right permissions (admin role check)
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You do not have permission to use this command.');
        }

        // Extract the item details from the command
        const [itemName, price, ...descriptionArr] = args;
        const description = descriptionArr.join(' ');

        // Check if the arguments are valid
        if (!itemName || !price || !description) {
            return message.reply('Please provide an item name, price, and description.');
        }

        // Ensure the price is a valid number
        const priceNum = parseFloat(price);
        if (isNaN(priceNum)) {
            return message.reply('Please provide a valid number for the price.');
        }

        try {
            // Check if an item with the same name already exists
            const existingItem = await ShopItem.findOne({ name: itemName.toLowerCase() });
            if (existingItem) {
                return message.reply('An item with that name already exists.');
            }

            // Create and save the new item to the shop
            const newItem = new ShopItem({
                name: itemName.toLowerCase(),
                price: priceNum,
                description
            });
            await newItem.save();

            message.reply(`Item **${itemName}** has been added to the shop!`);
        } catch (error) {
            console.error('Error adding item:', error);
            message.reply('There was an error adding the item to the shop.');
        }
    },
};
