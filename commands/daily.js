const User = require('../models/user'); // Ensure you have a user model
const ms = require('ms'); // A library to handle time formatting

module.exports = {
    name: 'daily',
    description: 'Claim your daily reward.',
    args: false,
    async execute(message) {
        const userId = message.author.id;

        try {
            // Fetch user data
            let user = await User.findOne({ userId });
            if (!user) {
                // Create user if not exists
                user = new User({ userId });
                await user.save();
            }

            // Check if user is eligible for daily claim
            const now = new Date();
            const lastClaim = user.lastDailyClaim;
            const timeSinceLastClaim = now - new Date(lastClaim);

            const cooldown = ms('24h'); // 24 hours cooldown

            if (lastClaim && timeSinceLastClaim < cooldown) {
                const timeLeft = cooldown - timeSinceLastClaim;
                const formattedTimeLeft = ms(timeLeft, { long: true });
                return message.reply(`You have already claimed your daily reward. Please wait ${formattedTimeLeft} before claiming again.`);
            }

            // Award daily reward
            const rewardAmount = 1000; // Amount of currency or items to give
            user.balance += rewardAmount;
            user.lastDailyClaim = now;

            await user.save();

            message.reply(`You've successfully claimed your daily reward of ${rewardAmount} currency!`);

        } catch (error) {
            console.error('Error claiming daily reward:', error);
            message.reply('There was an error claiming your daily reward.');
        }
    },
};
