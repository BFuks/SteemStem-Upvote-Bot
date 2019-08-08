const Discord = require("discord.js");
const steem = require("steem");
const config = require("./config.json");

var bot = new Discord.Client({
    autoReconnect: true
});

var cmd = require("./cmd-bot.js");
bot.on("ready", () => {
    console.log("--------------- SteemStem Bot Ready !");
    bot.user.setActivity('Sending votes ...!');
});


bot.on("message", async message => {
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    if (message.content.indexOf(config.prefix) !== 0) {
        return;
    }
    if (message.channel.type === "dm") {
        return
    }
    switch (command) {
        case "vote":
            return cmd.Vote(message);
        case "add_community_curator":
            return cmd.community_init(message);
        case "add_general_curator":
            return cmd.general_init(message);
        case "delete_curator":
            return cmd.delete_curator(message);
        case "update_role":
            return cmd.update_role(message);
        case "display_role":
            return cmd.display_role(message);
        case "blacklist":
            return cmd.blacklist_member(message);
        case "unblacklist":
            return cmd.unblacklist_member(message);
        case "add_team_member":
            return cmd.add_team_member(message);
        case "delete_team_member":
            return cmd.delete_team_member(message);            
        default:
            console.log('--------------- Unknown command');
    }
});


bot.on("disconnect", function() {
    console.log("--------------- Bot disconnected");
    bot.login(config.token);
    console.log("--------------- Curabot Ready ! (disconnect action event)");
});


bot.login(config.token);