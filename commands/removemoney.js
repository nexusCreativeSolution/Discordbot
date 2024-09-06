const { EmbedBuilder } = require('discord.js');
const Economy = require('../models/economy');

module.exports = {
    name: 'removemoney',
    description: 'Remove money from a user\'s balance.',
    args: true,
    usage: '<user> <amount>',
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('🚫 You do not have permission to use this command. 🚫');
        }

        const user = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!user || isNaN(amount) || amount <= 0) {
            return message.reply('🔍 Please mention a valid user and specify a valid amount to remove.');
        }

        try {
            let economyUser = await Economy.findOne({ userId: user.id });

            if (!economyUser) {
                economyUser = new Economy({
                    userId: user.id,
                    username: user.username,
                    balance: 0
                });
            }

            if (economyUser.balance < amount) {
                return message.reply(`💸 ${user.username} does not have enough balance to remove ${amount} coins.`);
            }

            economyUser.balance -= amount;
            await economyUser.save();

            // Create a fun and engaging embed message
            const embed = new EmbedBuilder()
                .setTitle('💰 Balance Updated! 💰')
                .setDescription(`
                    **Action**: Remove Money
                    **User**: ${user.username}
                    **Amount Removed**: ${amount} coins
                    **New Balance**: ${economyUser.balance} coins
                `)
                .setColor('#FF5733') // Orange color for action
                .setFooter({ text: '©️ Nexus Inc. | Balance Management' })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error removing money:', error);
            message.reply('⚠️ There was an error processing the request. ⚠️');
        }
    },
};
