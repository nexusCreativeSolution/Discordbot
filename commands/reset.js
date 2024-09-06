const Level = require('../models/level');
const Moderator = require('../models/moderator');

// Replace 'JOHN' with your chosen passcode
const PASSCODE = 'John';

module.exports = {
    name: 'reset',
    description: 'Reset a user\'s level back to 1.',
    args: true,
    usage: '<passcode> @user',
    async execute(message, args) {
        try {
            // Verify the user's permission with either passcode or moderator status
            const passcode = args.shift();
            const isModerator = await Moderator.findOne({ userId: message.author.id });
            
            if (message.author.id !== process.env.CREATOR_ID && !isModerator && passcode !== PASSCODE) {
                return message.reply('🚫 You do not have permission to use this command.');
            }

            // Check for a mentioned user
            const userToReset = message.mentions.users.first();
            if (!userToReset) {
                return message.reply('⚠️ Please mention a valid user to reset their level.');
            }

            // Reset user level and experience
            await Level.findOneAndUpdate(
                { userId: userToReset.id },
                { level: 1, experience: 0 },
                { upsert: true }
            );

            message.channel.send(`🔄 **${userToReset.username}**'s level has been successfully reset to **Level 1**.`);
        } catch (error) {
            console.error('Error resetting user level:', error);
            message.reply('❌ There was an error resetting the level. Please try again later.');
        }
    },
};
