const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require('fs');
const removeWords = ["nigger", "cunt", "jibber", "jibbers"];
const cooldowns = new Discord.Collection();

//Changes Test 3.0

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
const commandFiles = fs.readdirSync('./Commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./Events').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./Commands/${file}`);
    client.commands.set(command.name, command);
}

for (const file of eventFiles) {
    const event = require(`./Events/${file}`);
    client.events.set(event.name, event);
}


client.on("ready", () => {
    console.log("I am ready!");
});

client.on("message", (message) => {
    try {
        if (message.author.bot) return;

        const args = message.content.slice(config.prefix.length).split(' ');
        const commandName = args.shift().toLowerCase();

        const eventArray = client.events.array();
        const eventNames = eventArray.map(a => a.name);
        const messagestr = message.content.toLowerCase().split(' ');

        var findOne = function (haystack, arr) {
            return arr.some(function (v) {
                return haystack.indexOf(v) >= 0;
            });
        };

        var findEvent = function (haystack, arr) {
            var indexName
            arr.some(function (v) {
                if (haystack.indexOf(v) >= 0) {
                    indexName = haystack.indexOf(v);

                }
            });
            return indexName;
        };



        if (client.commands.has(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))) {

            const command = client.commands.get(commandName)
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) return;



            if (!cooldowns.has(command.name)) {
                cooldowns.set(command.name, new Discord.Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns;
            const cooldownAmount = (command.cooldown || 10) * 1000;

            if (!timestamps.has(command.name)) {
                timestamps.set(command.name, now);
                setTimeout(() => timestamps.delete(command.name), cooldownAmount);
            }
            else {
                if (message.member.hasPermission("ADMINISTRATOR")) {
                    var expirationTime = timestamps.get(command.name) + (cooldownAmount - 5000);
                }
                else {
                    var expirationTime = timestamps.get(command.name) + cooldownAmount;
                }
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return;
                }

                timestamps.set(command.name, now);
                setTimeout(() => timestamps.delete(command.name), cooldownAmount);
            }

            try {
                command.execute(message, args);
            }
            catch (error) {
                console.error(error);
                //message.reply('there was an error trying to execute that command!');
            }
        }
        else if (findOne(eventNames, messagestr) == true) {

            var eventExecute = findEvent(eventNames, messagestr)

            const event = client.events.get(eventNames[eventExecute]);

            if (!cooldowns.has(event.name)) {
                cooldowns.set(event.name, new Discord.Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns;
            const cooldownAmount = (event.cooldown || 10) * 1000;

            if (!timestamps.has(event.name)) {
                timestamps.set(event.name, now);
                setTimeout(() => timestamps.delete(event.name), cooldownAmount);
            }
            else {
                if (message.member.hasPermission("ADMINISTRATOR")) {
                    var expirationTime = timestamps.get(event.name) + (cooldownAmount - 5000);
                }
                else {
                    var expirationTime = timestamps.get(event.name) + cooldownAmount;
                }

                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return;
                }

                timestamps.set(event.name, now);
                setTimeout(() => timestamps.delete(event.name), cooldownAmount);
            }


            try {
                event.execute(message);
            }
            catch (error) {
                console.error(error);
                //message.reply('there was an error trying to execute that command!');
            }

        }
        else if (removeWords.some(word => messagestr.includes(word))) {
            try {
                const modChannel = '482724896607305740'; 
                message.delete()
                message.client.channels.get(modChannel).send(message.member.displayName + " sent the message '" + message + "' in " + message.channel.name + " channel.");

            }
            catch (error) {
                console.error(error);
                //message.reply('there was an error trying to execute that command!');
            }

        }
    }
    catch (error) {
        console.error(error);
        //message.reply('there was an error trying to execute that command!');
    }
});
client.login(config.token);