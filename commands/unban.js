const BannedUser = require('../models/bannedUser');

module.exports = {
    name: 'unban',
    description: 'Unban a user from using the bot.',
    args: true,
    usage: '<@user>',
    async execute(message, args) {
        // Check if the user has the Administrator permission
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('🚫 You do not have permission to use this command.');
        }

        // Check if a user was mentioned
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('⚠️ Please mention a valid user to unban from using the bot.');
        }

        try {
            // Check if the user is actually banned
            const bannedUser = await BannedUser.findOne({ userId: user.id });

            if (!bannedUser) {
                return message.reply(`⚠️ **${user.username}** is not banned.`);
            }

            // Remove the user from the banned list
            await BannedUser.deleteOne({ userId: user.id });

            message.reply(`✅ **${user.username}** has been successfully unbanned from using the bot.`);
        } catch (error) {
            console.error('Error unbanning user:', error);
            message.reply('❌ There was an error unbanning the user. Please try again later.');
        }
    },
};
