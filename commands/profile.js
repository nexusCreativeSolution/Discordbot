const Level = require('../models/level');
const Economy = require('../models/economy');
const Moderator = require('../models/moderator');

module.exports = {
    name: 'profile',
    description: 'View your profile including balance, level, and role.',
    args: false,
    async execute(message) {
        try {
            const userId = message.author.id;
            const user = message.guild.members.cache.get(userId);

            // Fetch user data from the database
            let levelData = await Level.findOne({ userId });
            if (!levelData) {
                levelData = { level: 1, experience: 0 };
            }

            let economyData = await Economy.findOne({ userId });
            if (!economyData) {
                economyData = { balance: 0 };
            }

            let role = 'Normal User'; // Default role
            if (user) {
                if (user.roles.cache.some(role => role.name === 'Admin')) {
                    role = 'Server Admin';
                } else if (user.roles.cache.some(role => role.name === 'Moderator')) {
                    role = 'Moderator';
                }
            }

            // Check for database entries for Moderator or Creator
            const isModerator = await Moderator.findOne({ userId });
            if (isModerator) {
                role = 'Legion'; // Display as Legion if in the Moderator database
            }

            if (userId === process.env.CREATOR_ID) {
                role = 'Legion'; // Bot creator role
            }

            // Fetch the user's avatar URL
            const avatarURL = message.author.displayAvatarURL({ format: 'png', dynamic: true, size: 2048 });

            // Create a professional profile message
            const profileMessage = `
**📜 Profile Overview**

**Username:** ${message.author.username}
**Balance:** 💵 $${economyData.balance}
**Level:** 🏆 ${levelData.level}
**Experience:** 🌟 ${levelData.experience}
**Role:** ${role}

━━━━━━━━━━━━━━━━━━━━
*©️ Nexus Inc.*`;

            // Send the profile message with the user's avatar
            message.reply({ content: profileMessage, files: [avatarURL] });

        } catch (error) {
            console.error('Error fetching profile data:', error);
            message.reply('There was an error fetching your profile data.');
        }
    },
};
