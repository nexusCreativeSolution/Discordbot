const { Client, GatewayIntentBits, Collection, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
const BannedUser = require('./models/bannedUser');
const Afk = require('./models/afk');
const Level = require('./models/level');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
        console.log(`Loaded command: ${command.name}`);
    } catch (error) {
        console.error(`Error loading command ${file}:`, error);
    }
}

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const bannedUser = await BannedUser.findOne({ userId: message.author.id });
    if (bannedUser) {
        return message.reply('You are banned from using this bot.');
    }

    const mentionedUser = message.mentions.users.first();
    if (mentionedUser) {
        const afkData = await Afk.findOne({ userId: mentionedUser.id });
        if (afkData) {
            message.reply(`${mentionedUser.username} is currently AFK: ${afkData.reason}`);
        }
    }

    // Leveling system
    const experiencePerMessage = 8;
    let user = await Level.findOne({ userId: message.author.id });

    if (!user) {
        user = new Level({
            userId: message.author.id,
            username: message.author.username,
            level: 1,
            experience: 0
        });
    }

    user.experience += experiencePerMessage;
    let experienceForNextLevel = user.level * 100;
    let levelUpMessage = '';

    while (user.experience >= experienceForNextLevel) {
        user.experience -= experienceForNextLevel;
        user.level += 1;

        const levelRoles = [
            { level: 2, role: '🏳Citizen' },
            { level: 4, role: '👼Baby Wizard' },
            { level: 6, role: '🧙‍♀️Wizard' },
            { level: 8, role: '🧙‍♂️Wizard Lord' },
            { level: 10, role: '🧚🏻Baby Mage' },
            { level: 12, role: '🧜Mage' },
            { level: 14, role: '🧜‍♂️Master of Mage' },
            { level: 16, role: '🌬Child of Nobel' },
            { level: 18, role: '❄Nobel' },
            { level: 20, role: '⚡Speed of Elite' },
            { level: 22, role: '🎭Elite' },
            { level: 24, role: '🥇Ace I' },
            { level: 26, role: '🥈Ace II' },
            { level: 28, role: '🥉Ace Master' },
            { level: 30, role: '🎖Ace Dominator' },
            { level: 32, role: '🏅Ace Elite' },
            { level: 34, role: '🏆Ace Supreme' },
            { level: 36, role: '💍Supreme I' },
            { level: 38, role: '💎Supreme II' },
            { level: 40, role: '🔮Supreme Master' },
            { level: 42, role: '🛡Legend III' },
            { level: 44, role: '🏹Legend II' },
            { level: 46, role: '⚔Legend' },
            { level: 55, role: '🐉Immortal' }
        ];

        const userRole = levelRoles.find(r => user.level <= r.level)?.role || 'GOD';

        levelUpMessage = `
╔══════════════════
║ 🎉 *Level Up!*
║
║ 👤 **Name**: ${message.author.username}
║ 🎐 **Level**: ${user.level}
║ 🛑 **XP**: ${user.experience} / ${experienceForNextLevel}
║ 📍 **Role**: ${userRole}
║
╚══════════════════`;

        experienceForNextLevel = user.level * 100;
    }

    await user.save();

    if (levelUpMessage) {
        await message.reply(levelUpMessage);
    }

    const prefix = '!';
    if (message.content.startsWith(prefix)) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        if (command) {
            try {
                await command.execute(message, args);
            } catch (error) {
                console.error(`Error executing command ${commandName}:`, error);
                message.reply('There was an error executing that command.');
            }
        } else {
            message.reply('Unknown command. Please use a valid command.');
        }
    }
});

client.on('guildMemberAdd', async member => {
    const channelId = '1281312666119442523';
    const welcomeChannel = member.guild.channels.cache.get(channelId);

    if (welcomeChannel) {
        const embed = new EmbedBuilder()
            .setTitle('Welcome to the server!')
            .setDescription(`Hello ${member}, welcome to **${member.guild.name}**! We're glad to have you here.`)
            .setColor('#00FF00')
            .setFooter({ text: 'Enjoy your stay!' });

        welcomeChannel.send({ embeds: [embed] });
    } else {
        console.error('Welcome channel not found.');
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Check if the user is setting AFK status
    if (message.content.startsWith('!afk')) {
        const reason = message.content.slice(5).trim() || 'No reason provided.';
        await Afk.findOneAndUpdate(
            { userId: message.author.id },
            { username: message.author.username, reason, timestamp: new Date() },
            { upsert: true }
        );
        // No reply confirming AFK status
        return; // Exit early to avoid further processing
    }

    // Check if the user is currently AFK
    const afkUser = await Afk.findOne({ userId: message.author.id });
    if (afkUser) {
        // Remove the user from AFK in MongoDB
        await Afk.findOneAndDelete({ userId: message.author.id });

        // Send a welcome back message
        await message.reply(`
🎉 Welcome back, *${message.author.username}*! Hope you had a good break! 😄
    ©️Nexus Inc. – We knew you'd return! 😎
        `);
    }

    // Check if the mentioned user is AFK and notify the message sender
    const mentionedUser = message.mentions.users.first();
    if (mentionedUser) {
        const afkData = await Afk.findOne({ userId: mentionedUser.id });
        if (afkData) {
            await message.reply(`${mentionedUser.username} is currently AFK: ${afkData.reason}`);
        }
    }
});
client.login(process.env.BOT_TOKEN);
