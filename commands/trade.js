const { MessageEmbed } = require('discord.js');
const Economy = require('../models/economy');

module.exports = {
    name: 'trade',
    description: 'Engage in a market bet: predict whether the market will go up or down.',
    args: true,
    usage: '<bet_amount> <up/down>',
    async execute(message, args) {
        const userId = message.author.id;
        const betAmount = parseInt(args[0]);
        const prediction = args[1].toLowerCase();
        const username = message.author.username;

        // Validate bet amount
        if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
            return message.reply('❌ **Invalid Bet:** Please enter a valid amount greater than 0.');
        }

        // Validate prediction
        if (prediction !== 'up' && prediction !== 'down') {
            return message.reply('❌ **Invalid Prediction:** Please choose either "up" or "down" for your trade.');
        }

        try {
            // Fetch user's economy data
            let economyData = await Economy.findOne({ userId });
            if (!economyData) {
                return message.reply('❌ **Economy Account Not Found:** You don\'t have an account yet. Earn some money first before trading.');
            }

            // Ensure user has enough balance to place the bet
            if (economyData.balance < betAmount) {
                return message.reply(`❌ **Insufficient Funds:** You only have $${economyData.balance}. Please lower your bet.`);
            }

            // Confirm trade with the user
            const confirmationEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('💹 Market Trade Confirmation')
                .setDescription(`You are about to place a **$${betAmount}** bet on the market going **${prediction.toUpperCase()}**. Do you confirm this trade?`)
                .setFooter('Type "confirm" to proceed or "cancel" to abort.');

            message.reply({ embeds: [confirmationEmbed] });

            // Await user confirmation
            const filter = m => m.author.id === userId && ['confirm', 'cancel'].includes(m.content.toLowerCase());
            const userResponse = await message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] }).catch(() => null);

            if (!userResponse || userResponse.first().content.toLowerCase() === 'cancel') {
                return message.reply('❌ **Trade Cancelled:** No changes were made to your balance.');
            }

            // Generate random market outcome (50/50 chance)
            const marketOutcome = Math.random() < 0.5 ? 'up' : 'down';

            // Outcome result embed
            const resultEmbed = new MessageEmbed().setFooter('© Nexus Inc.');

            // Determine if user won or lost
            if (marketOutcome === prediction) {
                const winnings = betAmount * 2;
                economyData.balance += winnings;

                resultEmbed
                    .setColor('#00ff00')
                    .setTitle('✅ **Market Success**')
                    .setDescription(`The market went **${marketOutcome.toUpperCase()}**!\nCongratulations **${username}**, you won **$${winnings}**!`)
                    .addField('New Balance', `$${economyData.balance}`, true)
                    .setThumbnail('https://linkto.image/success.png');
            } else {
                economyData.balance -= betAmount;

                resultEmbed
                    .setColor('#ff0000')
                    .setTitle('❌ **Market Decline**')
                    .setDescription(`The market went **${marketOutcome.toUpperCase()}**.\nSorry **${username}**, you lost **$${betAmount}**.`)
                    .addField('New Balance', `$${economyData.balance}`, true)
                    .setThumbnail('https://linkto.image/failure.png');
            }

            // Save economy data after trade
            await economyData.save();

            // Send the result to the user
            message.reply({ embeds: [resultEmbed] });

        } catch (error) {
            console.error('Error processing trade:', error);
            return message.reply('⚠️ **Error:** There was an error processing your trade. Please try again later.');
        }
    },
};
