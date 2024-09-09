const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();
const { PermissionsBitField } = require('discord.js');
const BannedUser = require('./models/bannedUser');
const Afk = require('./models/afk');
const Level = require('./models/level');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,  // Add this line to ensure the bot detects member join events
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
        } else if (commandName === 'broadcast') {
            if (message.member.permissions.has('ADMINISTRATOR')) {
                const broadcastMessage = args.join(' ');
                if (!broadcastMessage) {
                    return message.reply('Please provide a message to broadcast.');
                }

                const embed = new EmbedBuilder()
                .setTitle('📢 Broadcast Message 📢')
                .setDescription(broadcastMessage)
                .setColor('#FF0000')
                .setFooter({ text: 'Broadcast System' });

                // Send the broadcast message to all guilds
                
                

                client.guilds.cache.forEach(async guild => {
                    try {
                        const botMember = await guild.members.fetch(client.user.id);
                        const defaultChannel = guild.channels.cache.find(channel => 
                            channel.type === ChannelType.GuildText && 
                            channel.permissionsFor(botMember).has(PermissionsBitField.Flags.SendMessages)
                        );
                        if (defaultChannel) {
                            await defaultChannel.send({ embeds: [embed] });
                        }
                    } catch (error) {
                        console.error(`Error fetching bot member or sending message in guild ${guild.id}:`, error);
                    }
                });

                message.reply('Broadcast message sent!');
            } else {
                message.reply('You do not have permission to use this command.');
            }
        } else {
            message.reply('Unknown command. Please use a valid command.');
        }
    }
});

client.on('error', error => {
    console.error('An error occurred:', error);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    if (message.channel.type === 'DM') {
        if (message.content.startsWith('!hello')) {
            await message.reply('Hello! How can I assist you today?');
        }
    }
});
client.on('guildMemberAdd', async member => {
    const channelId = '1282326078139924483';
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
client.login(process.env.BOT_TOKEN);
