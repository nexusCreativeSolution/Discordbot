const { EmbedBuilder } = require('discord.js');
const Moderator = require('../models/moderator');

const PASSCODE = 'John';

module.exports = {
    name: 'addmod',
    description: 'Add a user as a moderator.',
    args: true,
    async execute(message, args) {
        try {
            // Verify if the author is a moderator or has the correct passcode
            const isModerator = await Moderator.findOne({ userId: message.author.id });
            const passcode = args.shift();

            if (message.author.id !== process.env.CREATOR_ID && !isModerator && passcode !== PASSCODE) {
                return message.reply('🚫 **You don\'t have the power to use this command!** 🚫');
            }

            // Get the user to add
            const userToAdd = message.mentions.users.first();
            if (!userToAdd) {
                return message.reply('🔍 **Please mention a user you want to promote to moderator!**');
            }

            // Check if the user is already a moderator
            const existingMod = await Moderator.findOne({ userId: userToAdd.id });
            if (existingMod) {
                return message.reply(`🛡️ **${userToAdd.username} is already a moderator!**`);
            }

            // Add the user as a new moderator
            const newModerator = new Moderator({
                userId: userToAdd.id,
                username: userToAdd.username
            });

            await newModerator.save();

            // Create a fun and engaging embed message
            const embed = new EmbedBuilder()
                .setTitle('🎉 **New Moderator Unlocked!** 🎉')
                .setDescription(`
                🌟 **Congratulations!** 🌟
                **${userToAdd.username}** has been promoted to moderator! 🎖️
                They are now part of the team and will help keep everything in order. 👮‍♂️
                Let’s give them a warm welcome! 🎊
                `)
                .setColor('#4CAF50') // Green color for success
                .setFooter({ text: '©️ Nexus Inc. | Elevate Your Experience!' })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error executing addmod command:', error);
            message.reply('⚠️ **Oops! Something went wrong.** ⚠️');
        }
    },
};
