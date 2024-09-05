const Level = require('../models/level');
const Moderator = require('../models/moderator');

// Replace 'JOHN' with your chosen passcode
const PASSCODE = 'John';

module.exports = {
    name: 'reset',
    description: 'Reset user level.',
    args: true,
    async execute(message, args) {
        // Check if the user is a moderator or the creator using passcode
        const isModerator = await Moderator.findOne({ userId: message.author.id });
        const passcode = args.shift();
        if (message.author.id !== process.env.CREATOR_ID && !isModerator && passcode !== PASSCODE) {
            return message.reply('You do not have permission to use this command.');
        }

        const userToReset = message.mentions.users.first();
        if (!userToReset) {
            return message.reply('Please mention a user to reset.');
        }

        // Reset user level
        await Level.findOneAndUpdate(
            { userId: userToReset.id },
            { level: 1, experience: 0 },
            { upsert: true }
        );

        message.channel.send(`Level of ${userToReset.username} has been reset.`);
    },
};
