const Afk = require('../models/afk');

module.exports = {
    name: 'afk',
    description: 'Set yourself as AFK and let others know you’re busy! 😴',
    args: true,
    usage: '<reason>',
    async execute(message, args) {
        const reason = args.join(' ') || 'No reason provided 🌙';

        // Save the user as AFK in MongoDB with timestamp
        await Afk.findOneAndUpdate(
            { userId: message.author.id },
            { username: message.author.username, reason, timestamp: new Date() },
            { upsert: true }
        );

        // Fun and branded response for setting AFK
        message.reply(`
🚶‍♂️ *${message.author.username}* is now AFK! 💤
Reason: ${reason}
Don't worry, they'll be back soon! ⏳
In the meantime, maybe grab a snack? 🍕

    ©️Nexus Inc. – We’ll keep things running while you’re away! 😎
        `);
    },
};
