const Discord = require("discord.js");
const config = require("../config.json");
const snoowrap = require('snoowrap');

const r = new snoowrap({
    userAgent: config.userAgent,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    username: config.username,
    password: config.password
});

function redditEmbed() {
    const embed = new Discord.RichEmbed();
    embed.setTitle("Top Posts of r/minnesotavikings subreddit");
    embed.setColor(0xeee657);
    embed.setTimestamp();
    r.getSubreddit('minnesotavikings').getHot({ limit: 3 }).map(post =>
        embed.addField(post.title, "[Link to Post - " + post.score + " Upvotes and " + post.num_comments + " Comments](https://old.reddit.com" + post.permalink + ")"))
    return embed;
}

module.exports = {
    name: 'top',
    cooldown: 10,
    description: 'Displays the top posts of the r/minnesotavikings subreddit',
    aliases: ['reddit'],
    execute(message, args) {
        embed = redditEmbed();
        message.channel.startTyping();
        setTimeout(() => {
            message.channel.send(embed);
            message.channel.stopTyping();
        }, 1100);
    },
};