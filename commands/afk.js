const Afk = require('../models/afk');

module.exports = {
    name: 'afk',
    description: 'Set yourself as AFK.',
    args: true,
    usage: '<reason>',
    async execute(message, args) {
        const reason = args.join(' ') || 'No reason provided';

        // Save the user as AFK in MongoDB
        await Afk.findOneAndUpdate(
            { userId: message.author.id },
            { username: message.author.username, reason },
            { upsert: true }
        );

        message.reply(`You are now AFK: ${reason}`);
    },
};
