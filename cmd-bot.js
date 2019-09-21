// Configuration
const Discord = require("discord.js");
const steem = require("steem");
const config = require("./config.json");

// Initiatlisation
const bot = new Discord.Client();
var curatorsDb    = require("./db/curator.js");
var membersDb     = require("./db/steemitMember.js");
var teamMembersDb = require('./db/teamMember.js');
var modules       = require("./actions/sendVote.js");
bot.login(config.token);

// The methods
module.exports =
{
  // Vote command
  Vote: function(message)
  {
    if (message.content === "undefined" || message.content.length < 1)
      { return message.channel.send("Invalid data !") }
    // Getting the infirmation on the vote
    let element        = message.content.split(" ");
    if(element.length!=3) { message.channel.send("Invalid vote command"); return; }
    let url            = element.pop();
    let value          = element.pop();
    let trueValue      = value.split("/")
    if(trueValue.length!=2) { message.channel.send("Invalid vote command"); return; }
    let curieValue     = trueValue.pop();
    let steemstemValue = trueValue.pop();
    let data           = url.split("/")
    if(data.length<2) { message.channel.send("Invalid vote command"); return; }
    let permlink       = data.pop()
    let author         = data.pop()
    // Voting message
    message.channel.send("This post is getting upvoted!")
    return modules.sendVote(message, steemstemValue, curieValue, author, permlink);
  },

  // List the curators
  list_curators: function(message)
  {
    if(!message.member.permissions.has("ADMINISTRATOR")) { return message.channel.send('Unauthorized action'); }
    let mongoose = require('mongoose'); mongoose.connect(config.db_url);
    let CuratorSchema = require('./db/curatorSchema.js');
    let CuratorModel = mongoose.model('curators', CuratorSchema.CuratorSchema);
    CuratorModel.find({}, function(err, res)
    {
      // If an error
      if(err) { console.log('Error when listing all curators'); return; }
      // else
      let text = '';
      for(let i=0; i<res.length; i++)
      {
        text = text + (i+1).toString() + '\t' + res[i]['username'] + '   (' + res[i]['role'] + ')\n';
      }
      return  message.channel.send(text);
    });
  },

  // Add a curator
  add_curator: function(message, role)
  {
    // Checks (permission + syntax)
    if(!message.member.permissions.has("ADMINISTRATOR")) { return message.channel.send('Unauthorized action'); }
    if(!message.content) { return message.channel.send("Invalid syntax (add_community_curator).") }
    let element = message.content.split(' ');
    if (element.length!=2)  { return message.channel.send("Invalid syntax (delete_curator).") }

    // Adding the curator to the DB (with the correct role)
    let username = element.pop().trim();
    message.channel.send('Adding ' + username + ' to the curator database');
    username = username.substring(2, username.length - 1);
    if (!bot.users.get(username)) { return message.channel.send(" -> User not found..."); }
    let name = bot.users.get(username).username;
    if (name) { return curatorsDb.init(username, name, role, message); }
    else { return message.channel.send("User not found..."); }
  },

  // Delete a curator
  delete_curator: function(message)
  {
    // Checks (permission + syntax)
    if(!message.member.permissions.has("ADMINISTRATOR")) { return message.channel.send('Unauthorized action'); }
    if(!message.content) { return message.channel.send("Invalid syntax (delete_curator).") }
    let element = message.content.split(' ');
    if (element.length!=2)  { return message.channel.send("Invalid syntax (delete_curator).") }

    // Deleting the curator from the DB
    let username = element.pop().trim();
    message.channel.send('Deleting ' + username + ' from the curator database');
    let mongoose = require('mongoose'); mongoose.connect(config.db_url);
    let CuratorSchema = require('./db/curatorSchema.js');
    let CuratorModel = mongoose.model('curators', CuratorSchema.CuratorSchema);
    CuratorModel.deleteOne( { username:username}, function(err, res)
    {
      // Non-existing curator
      if (err) { return message.channel.send(" -> User not found..."); }
      if (res.n > 0) { return message.channel.send(' -> User deleted'); }
      else { return message.channel.send(" -> User not found..."); }
    });
  },

    update_role: function(message) {
        if (message.content === "undefined" || message.content.length < 1) {
            return message.channel.send("Invalid data !")
        }
        if (message.member.permissions.has("ADMINISTRATOR")) {
            let element = message.content.split(" ")
            username = element.pop();
            username.trim()
            id = username.substring(2, username.length - 1)
            if (bot.users.get(id) != undefined) {
                name = bot.users.get(id).username
                if (name != undefined) {
                    return curatorsDb.updateRoleUser(id, name, message)
                } else {
                    return message.channel.send("User not found !")
                }
            } else {
                return message.channel.send("User not found !")
            }
        } else {
            return message.channel.send("Not authorized ! This action is reserved to admin's only !")
        }
    },
    display_role: function(message) {
        if (message.content === "undefined" || message.content.length < 1) {
            return message.channel.send("Invalid data !")
        }
        if (message.member.permissions.has("ADMINISTRATOR")) {
            let element = message.content.split(" ")
            username = element.pop();
            username.trim()
            id = username.substring(2, username.length - 1)
            if (bot.users.get(id) != undefined) {
                name = bot.users.get(id).username
                if (name != undefined) {
                    return curatorsDb.displayRoleUser(id, message)
                } else {
                    return message.channel.send("User not found !")
                }
            } else {
                return message.channel.send("User not found !")
            }
        } else {
            return message.channel.send("Not authorized ! This action is reserved to admin's only !")
        }
    },

    blacklist_member: function(message) {

      if (typeof message.content === 'undefined' || message.content.length < 1) {
        return message.channel.send('Invalid data !')
      }

      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.channel.send('Not authorized to do this!')
      }

      let username = message.content.trim().split(/\s+/)[1]

      if (typeof username === 'undefined'){
        return message.channel.send('It seems that you didn\'t specify a Steemit user to be blacklisted.')
      }

      steem.api.getAccounts([username], function(err, res) {
        if (err) {
          return message.channel.send('Error! Try again.')
        }

        if (res.length === 0) {
          return message.channel.send('Apparently, that Steemit user doesn\'t exist.')
        } 

        return membersDb.setMemberToAList(username, 'blacklist', message)
        })
    },

    unblacklist_member: function(message){
      if (typeof message.content === 'undefined' || message.content.length < 1) {
        return message.channel.send('Invalid data!')
      }

      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.channel.send('Not authorized to do this!')
      }

      let username = message.content.trim().split(/\s+/)[1]

      if (typeof username === 'undefined'){
        return message.channel.send('Please specify a Steemit user.')
      }

      steem.api.getAccounts([username], function(err, res) {
        if (err) {
          return message.channel.send('Error! Try again.')
        }

        if (res.length === 0) {
          return message.channel.send('Apparently, that Steemit user doesn\'t exist.')
        }

        return membersDb.removeUserFromLists(username, message)
      })
    },

    add_team_member: function(message) {
      if (typeof message.content === 'undefined' || message.content.length < 1) {
        return message.channel.send('Invalid data!')
      }

      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.channel.send('Not authorized to do this!')
      }

      let users = message.content.trim().split(/\s+/)
      if (users.length <= 1) {
        return message.channel.send('Invalid data!!')
      }      
      users.shift()
      users = [...new Set(users)]
      
      steem.api.getAccounts(users, (err, res) => {
        if (err) {
            console.log("Error: " + err)
            return message.channel.send('Error when fetching the usernames from Steem')
        }
        let nusers = users.filter((user) => res.find((e) => e.name === user))
        console.log("filtered users: " + nusers)
        if (nusers.length == 0) {
            return message.channel.send('None of the Steem usernames provided is valid')
        } 

        return teamMembersDb.add(nusers, message)
      })
    },

    delete_team_member: function(message) {
      if (typeof message.content === 'undefined' || message.content.length < 1) {
        return message.channel.send('Invalid data!')
      }

      if (!message.member.permissions.has('ADMINISTRATOR')) {
        return message.channel.send('Not authorized to do this!')
      }

      let users = message.content.trim().split(/\s+/)
      if (users.length <= 1) {
        return message.channel.send('Invalid data!!')
      }      
      users.shift()
      users = [...new Set(users)]
      
      steem.api.getAccounts(users, (err, res) => {
        if (err) {
            console.log("Error: " + err)
            return message.channel.send('Error when fetching the usernames from Steem')
        }
        let nusers = users.filter((user) => res.find((e) => e.name === user))
        // console.log("users filtered: " + nusers)
        if (nusers.length == 0) {
            return message.channel.send('None of the Steem usernames provided is valid')
        } 

        return teamMembersDb.remove(nusers, message)
      })
    },
} //End module
