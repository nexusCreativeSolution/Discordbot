const Afk = require('../models/afk');

module.exports = {
    name: 'afk',
    description: 'Set yourself as AFK and let others know you’re busy! 😴',
    args: true,
    usage: '<reason>',
    async execute(message, args) {
        const reason = args.join(' ') || 'No reason provided 🌙';

        // Save the user as AFK in MongoDB
        await Afk.findOneAndUpdate(
            { userId: message.author.id },
            { username: message.author.username, reason },
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

    async checkAfkStatus(message) {
        const afkUser = await Afk.findOne({ userId: message.author.id });

        if (afkUser) {
            // Remove the user from AFK in MongoDB
            await Afk.findOneAndDelete({ userId: message.author.id });

            // Welcome them back
            message.reply(`
🎉 Welcome back, *${message.author.username}*! Hope you had a good break! 😄
    ©️Nexus Inc. – We knew you'd return! 😎
            `);
        }
    }
};
