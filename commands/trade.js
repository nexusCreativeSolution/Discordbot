const { EmbedBuilder } = require('discord.js');
const Economy = require('../models/economy');

module.exports = {
    name: 'trade',
    description: 'Bet on whether the market will go up or down. Double or nothing! 📈📉',
    args: true,
    usage: '<up/down> <amount>',
    async execute(message, args) {
        try {
            if (args.length < 2) {
                return message.reply('Please specify your trade direction (`"up"` or `"down"`) and the amount to bet. 🧐');
            }

            const tradeDirection = args[0].toLowerCase();
            const betAmount = parseFloat(args[1]);

            if (tradeDirection !== 'up' && tradeDirection !== 'down') {
                return message.reply('Invalid trade direction! Please specify either `"up"` or `"down"`. 🤔');
            }

            if (isNaN(betAmount) || betAmount <= 0) {
                return message.reply('Invalid bet amount! Please specify a positive number. 🚫');
            }

            let user = await Economy.findOne({ userId: message.author.id });
            if (!user) {
                user = new Economy({
                    userId: message.author.id,
                    balance: 0
                });
                await user.save();
            }

            if (user.balance < betAmount) {
                return message.reply('You do not have enough money to place this bet. 💸');
            }

            user.balance -= betAmount;
            await user.save();

            const outcome = Math.random() < 0.5 ? 'up' : 'down'; // Random outcome

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🎲 Trade Result 🎲')
                .setDescription(`You bet on the market going **${tradeDirection}**.`)
                .addFields(
                    { name: '📊 Market Result', value: `The market went **${outcome}**!`, inline: true },
                    { name: '💰 Bet Amount', value: `$${betAmount}`, inline: true }
                );

            if (outcome === tradeDirection) {
                const winnings = betAmount * 2;
                user.balance += winnings;
                await user.save();

                embed.addFields(
                    { name: '🏆 Result', value: `Congratulations! 🎉 You won $${winnings}.`, inline: false }
                );
            } else {
                embed.addFields(
                    { name: '❌ Result', value: `Sorry, you lost $${betAmount}. Better luck next time!`, inline: false }
                );
            }

            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error executing trade command:', error);
            message.reply('There was an error executing the trade command. 😔');
        }
    },
};
