module.exports = {
    name: 'hello',
    description: 'Replies with a random greeting!',
    execute(message, args) {
        const greetings = [
            `Hello, ${message.author.username}! Hope you're having an awesome day! 😄`,
            `Hey there, ${message.author.username}! What's up? 😊`,
            `Hi, ${message.author.username}! How's it going? 🌟`,
            `Yo, ${message.author.username}! Ready to have some fun? 😎`,
            `Greetings, ${message.author.username}! Wishing you a fantastic day! 🎉`
        ];

        // Select a random greeting
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

        message.channel.send(randomGreeting);
    },
};
