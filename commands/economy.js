const Economy = require('../models/economy');

module.exports = {
    name: 'balance',
    description: 'Check your balance.',
    args: false,
    async execute(message) {
        try {
            let user = await Economy.findOne({ userId: message.author.id });

            if (!user) {
                user = new Economy({
                    userId: message.author.id,
                    username: message.author.username,
                    balance: 0
                });
                await user.save();
            }

            message.reply(`Your balance is: ${user.balance}`);
        } catch (error) {
            console.error('Error fetching balance:', error);
            message.reply('There was an error fetching your balance.');
        }
    },
};
