const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Afk = require('./models/afk');
const Level = require('./models/level');
const Moderator = require('./models/moderator');

// Initialize the client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Load commands
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

// Connect to MongoDB
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

    // Check for AFK mentions
    const afkData = await Afk.findOne({ userId: message.mentions.users.first()?.id });
    if (afkData) {
        message.reply(`${message.mentions.users.first().username} is currently AFK: ${afkData.reason}`);
    }

    // Handle experience points and level-ups
    const experiencePerMessage = 8; // Amount of XP to add for each message
    let user = await Level.findOne({ userId: message.author.id });

    if (!user) {
        user = new Level({
            userId: message.author.id,
            username: message.author.username,
            level: 1,
            experience: 0
        });
    }

    // Add experience points
    user.experience += experiencePerMessage;

    // Define experience required to level up
    let experienceForNextLevel = user.level * 100; // Example threshold for leveling up
    let levelUpMessage = '';

    // Check for level-ups
    while (user.experience >= experienceForNextLevel) {
        user.experience -= experienceForNextLevel;
        user.level += 1;

        // Define roles based on levels
        let role = 'GOD'; // Default role for levels above 55
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

        // Find current role based on level
        const userRole = levelRoles.find(r => user.level <= r.level)?.role || 'GOD';

        levelUpMessage = `
╔════◇
║ *Wow, Someone just*
║ *leveled Up huh⭐*
║ *👤Name*: ${message.author.username}
║ *🎐Level*: ${user.level}
║ *🛑Exp*: ${user.experience} / ${experienceForNextLevel}
║ *📍Role*: *${userRole}*
║ *Enjoy🥳*
╚════════════╝`;

        // Update experience threshold for the next level
        experienceForNextLevel = user.level * 100;
    }

    // Save user data
    await user.save();

    // Send notification if the user leveled up
    if (levelUpMessage) {
        await message.reply(levelUpMessage);
    }

    // Handle commands
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

// Error handling
client.on('error', (error) => {
    console.error('An error occurred:', error);
});

// Log in to Discord
client.login(process.env.BOT_TOKEN);
