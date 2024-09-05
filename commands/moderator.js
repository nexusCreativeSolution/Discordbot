const Moderator = require('../models/moderator');


const PASSCODE = 'John';

module.exports = {
    name: 'addmod',
    description: 'Add a user as a moderator.',
    args: true,
    async execute(message, args) {
        const isModerator = await Moderator.findOne({ userId: message.author.id });
        const passcode = args.shift();
        if (message.author.id !== process.env.CREATOR_ID && !isModerator && passcode !== PASSCODE) {
            return message.reply('You do not have permission to use this command.');
        }

        const userToAdd = message.mentions.users.first();
        if (!userToAdd) {
            return message.reply('Please mention a user to add as a moderator.');
        }

        // Add user as a moderator
        const existingMod = await Moderator.findOne({ userId: userToAdd.id });
        if (existingMod) {
            return message.reply(`${userToAdd.username} is already a moderator.`);
        }

        const newModerator = new Moderator({
            userId: userToAdd.id,
            username: userToAdd.username
        });

        await newModerator.save();
        message.channel.send(`${userToAdd.username} has been added as a moderator.`);
    },
};
