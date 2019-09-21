// Configuration
const Discord = require("discord.js");
const steem = require("steem");
const config = require("./config.json");

// Initiatization
var bot = new Discord.Client({ autoReconnect: true });
var cmd = require("./cmd-bot.js");
bot.on("ready", () => { console.log("SteemStem Bot Ready!"); bot.user.setActivity('Sending votes...'); });

// Main method
bot.on("message", async message =>
{
  const args    = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  if (message.content.indexOf(config.prefix) !== 0) { return; }
  if (message.channel.type === "dm") { return; }

  let mongoose = require('mongoose'); mongoose.connect(config.db_url);
  let CuratorSchema = require('./db/curatorSchema.js');
  let CuratorModel = mongoose.model('curators', CuratorSchema.CuratorSchema);
  let id = message.author.id;
  console.log("New bot command from ", id, ":", command);
  CuratorModel.findOne({ user_id: id }, function(err, res)
  {
    // Error
    if(err) { console.log("Error with a command", err); return; }

    // If success
    switch (command)
    {
      case "vote":                  { return cmd.Vote(message);                     }
      case "list_curators":         { return cmd.list_curators(message);            }
      case "delete_curator":        { return cmd.delete_curator(message);           }
      case "add_community_curator": { return cmd.add_curator(message, 'community'); }
      case "add_general_curator":   { return cmd.add_curator(message, 'general');   }
      case "help":                  { return cmd.help();                            }
      case "update_role":           { return cmd.update_role(message);              }
      case "display_role":          { return cmd.display_role(message);             }
      case "blacklist":             { return cmd.blacklist_member(message);         }
      case "unblacklist":           { return cmd.unblacklist_member(message);       }
      case "showblacklist":         { return cmd.showblacklist();                   }
      case "add_team_member":       { return cmd.add_team_member(message);          }
      case "delete_team_member":    { return cmd.delete_team_member(message);       }
      default: { console.log('  -> Unknown command:', command); return; }
    }
  });
});

// Disconnecting the bot
bot.on("disconnect", function() {
    console.log("--------------- Bot disconnected");
    bot.login(config.token);
    console.log("--------------- Curabot Ready ! (disconnect action event)");
});

// Login of the bot
bot.login(config.token);
