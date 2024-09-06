const Economy = require('../models/economy');

module.exports = {
    name: 'balance',
    description: 'Check your balance and see how rich you are! 💸',
    args: false,
    async execute(message) {
        try {
            // Find or create the user economy profile
            let user = await Economy.findOne({ userId: message.author.id });

            if (!user) {
                // Create a new user profile with a starting balance of 0
                user = new Economy({
                    userId: message.author.id,
                    username: message.author.username,
                    balance: 0
                });
                await user.save();
            }

            // Fun and engaging balance message
            message.reply(`
💰 **Balance Check for ${message.author.username}!**
Your current balance is: **${user.balance}** coins 🪙

Keep grinding and maybe you’ll be rolling in even more cash soon! 💵💼

    ©️Nexus Inc. – Your wealth is safe with us. 😉
            `);
        } catch (error) {
            console.error('Error fetching balance:', error);
            message.reply('Uh oh! There was an issue fetching your balance. Please try again later. 😓');
        }
    },
};
