const Economy = require('../models/economy');

module.exports = {
    name: 'addmoney',
    description: 'Add money to a user\'s balance.',
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

            economyUser.balance += amount;
            await economyUser.save();

            message.reply(`Added ${amount} to ${user.username}'s balance.`);
        } catch (error) {
            console.error('Error adding money:', error);
            message.reply('There was an error adding money.');
        }
    },
};
