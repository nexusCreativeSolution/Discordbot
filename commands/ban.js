const BannedUser = require('../models/bannedUser'); // Ensure you have a bannedUser model

module.exports = {
    name: 'ban',
    description: 'Ban a user from using the bot.',
    args: true,
    usage: '<user>',
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You do not have permission to use this command.');
        }

        const user = message.mentions.users.first();

        if (!user) {
            return message.reply('Please mention a user to ban from using the bot.');
        }

        try {
            // Add user to the banned list
            const bannedUser = new BannedUser({
                userId: user.id,
                username: user.username
            });

            await bannedUser.save();
            message.reply(`${user.username} has been banned from using the bot.`);
        } catch (error) {
            console.error('Error banning user:', error);
            message.reply('There was an error banning the user.');
        }
    },
};
