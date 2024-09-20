const Economy = require('../models/economy'); // Make sure this path is correct
const ms = require('ms'); // Time formatting library

module.exports = {
    name: 'work',
    description: 'Work to earn money every day.',
    args: false,
    async execute(message) {
        const userId = message.author.id;

        try {
            // Fetch user data
            let user = await Economy.findOne({ userId });
            if (!user) {
                // Create user if not exists
                user = new Economy({ userId, username: message.author.username });
                await user.save();
            }

            // Check if user is eligible for work
            const now = new Date();
            const lastWork = user.lastWorkClaim;
            const timeSinceLastWork = now - new Date(lastWork);

            const cooldown = ms('24h'); // 24 hours cooldown

            if (lastWork && timeSinceLastWork < cooldown) {
                const timeLeft = cooldown - timeSinceLastWork;
                const formattedTimeLeft = ms(timeLeft, { long: true });
                return message.reply(`You have already worked today. Please wait ${formattedTimeLeft} before working again.`);
            }

            // Award daily work reward
            const rewardAmount = 10000; // Amount of currency or items to give
            user.balance += rewardAmount;
            user.lastWorkClaim = now;

            await user.save();

            message.reply(`You've successfully completed your daily work and earned ${rewardAmount} currency!`);

        } catch (error) {
            console.error('Error performing work:', error);
            message.reply('There was an error performing your work.');
        }
    },
};
