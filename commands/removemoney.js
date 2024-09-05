const Economy = require('../models/economy');

module.exports = {
    name: 'removemoney',
    description: 'Remove money from a user\'s balance.',
    args: true,
    usage: '<user> <amount>',
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You do not have permission to use this command.');
        }

        const user = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!user || isNaN(amount) || amount <= 0) {
            return message.reply('Please mention a valid user and specify a valid amount.');
        }

        try {
            let economyUser = await Economy.findOne({ userId: user.id });

            if (!economyUser) {
                economyUser = new Economy({
                    userId: user.id,
                    username: user.username,
                    balance: 0
                });
            }

            if (economyUser.balance < amount) {
                return message.reply('The user does not have enough balance.');
            }

            economyUser.balance -= amount;
            await economyUser.save();

            message.reply(`Removed ${amount} from ${user.username}'s balance.`);
        } catch (error) {
            console.error('Error removing money:', error);
            message.reply('There was an error removing money.');
        }
    },
};
