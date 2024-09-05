const Economy = require('../models/economy');

// Define the winning pattern
const WINNING_PATTERN = ['left', 'right', 'left', 'left', 'left', 'right', 'right', 'left', 'right', 'right'];

module.exports = {
    name: 'gamble',
    description: 'Gamble by choosing between "left" or "right".',
    args: true,
    usage: '<amount> <choice>',
    async execute(message, args) {
        const amount = parseInt(args[0]);
        const userChoice = args[1]?.toLowerCase(); // Get the user's choice

        if (isNaN(amount) || amount <= 0) {
            return message.reply('Please specify a valid amount to gamble.');
        }

        if (userChoice !== 'left' && userChoice !== 'right') {
            return message.reply('Please choose either "left" or "right".');
        }

        try {
            let user = await Economy.findOne({ userId: message.author.id });

            if (!user) {
                user = new Economy({
                    userId: message.author.id,
                    username: message.author.username,
                    balance: 0
                });
                await user.save();
            }

            if (user.balance < amount) {
                return message.reply('You do not have enough balance to gamble this amount.');
            }

            // Simulate gambling outcome
            const correctChoice = WINNING_PATTERN[Math.floor(Math.random() * WINNING_PATTERN.length)];
            const isWinning = userChoice === correctChoice;

            // Set win/loss conditions
            const winMultiplier = 5; // Amount to multiply the bet by if the user wins
            const lossPenalty = 1; // Penalty for losing

            if (isWinning) {
                const winnings = amount * winMultiplier;
                user.balance += winnings;
                await user.save();
                message.reply(`Congratulations! You chose correctly and won ${winnings} coins. Your new balance is ${user.balance} coins.`);
            } else {
                user.balance -= amount * lossPenalty;
                await user.save();
                message.reply(`Sorry, you chose incorrectly and lost ${amount * lossPenalty} coins. Your new balance is ${user.balance} coins.`);
            }
        } catch (error) {
            console.error('Error executing gamble command:', error);
            message.reply('There was an error executing that command.');
        }
    },
};
