const Discord = require("discord.js");
const config = require("./../config.json");
const steem = require("steem");

var bot = new Discord.Client();
var mongoose = require('mongoose');


// Connect to DB
mongoose.connect(config.db_url);

// Connect to the Bot
// bot.login(config.token);


var SteemitMemberSchema = require('./steemitMemberSchema.js')
var SteemitMemberModel = mongoose.model('steemit_members', SteemitMemberSchema.SteemitMemberSchema);

module.exports = {

    isBlacklisted: function(username) {
        return new Promise((resolve, reject) => {
            SteemitMemberModel.findOne({
                username: username.toLowerCase()
            }, function(err, res) {
                console.log(err, res);
                if (err) {
                    reject("----Error promise is blacklisted----");
                }
                else {
                    if (res == null) {
                        resolve (false);
                    }
                    else if (res.list === "blacklist") {
                        console.log("en lista negra");
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                }
            });

        });   
    },

    setMemberToAList: function(username, list, message) {
        var steemitMember = new SteemitMemberModel();
        steemitMember.username = username.toLowerCase()
        steemitMember.list = list
        SteemitMemberModel.findOne({
            username: username
        }, function(err, res) {
            if (res == null) {            
                steemitMember.save(function(err, res) {
                    if (res) {
                        return message.channel.send("User added to the **" + list + "** !")
                    } 
                    else {
                        return message.channel.send("Error ! Please try again ! ")
                    }
                });

            } else {
                if (res.list === list){
                    return message.channel.send("Already in that list.");
                }
                else {                    
                    steemitMember.save(function(err, res) {
                        if (res) {
                            return message.channel.send("User changed to the " + list + "!");
                        } 
                        else {
                            return message.channel.send("Error ! Please try again ! ");
                        }
                    });
                }
            }
        });
    },

    removeUserFromLists: function(username, message) {
        SteemitMemberModel.deleteOne({
            username: username.toLowerCase()
        }, function(err, res) {
            if (err){
                return message.channel.send('Error! Please try again');
            }
            else {
                if (res.n > 0) {
                    return message.channel.send('User removed from all the lists');
                } 
                else {
                    return message.channel.send('Sorry, user not found!');
                }
            }
        });
    },
}