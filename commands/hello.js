module.exports = {
    name: 'hello',
    description: 'Replies with a greeting!',
    execute(message, args) {
        message.channel.send(`Hello, ${message.author.username}!`);
    },
};
