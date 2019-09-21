const Discord = require("discord.js");
const config = require("./../config.json");
const steem = require("steem");

var bot = new Discord.Client();
var mongoose = require('mongoose');


// Connect to DB
mongoose.connect(config.db_url);

// Connect to the Bot
bot.login(config.token);


var CuratorSchema = require('./curatorSchema.js')

var CuratorModel = mongoose.model('curators', CuratorSchema.CuratorSchema);

module.exports = {
    init: function(id, username, role, message) {
        var curator = new CuratorModel();
        curator.user_id = id
        curator.username = username
        curator.role = role
        CuratorModel.findOne({
            user_id: id
        }, function(err, res) {
            if (res == null) {
                if (message.member.permissions.has("ADMINISTRATOR")) {
                    curator.save(function(err, res) {
                        if (res) {
                            return message.channel.send(" -> " + role + " curator " + username + " added to the DB.")
                        } else {
                            return message.channel.send("Error ! Please try again ! ")
                        }
                    })

                } else {
                    return message.channel.send("Sorry you are not allowed to use this function. Please contact a moderator or the server admin.")
                }
            } else {
                return message.channel.send('Already registered !')
            }
        });
    },

    deleteUser: function(id, message) {
        if (message.member.permissions.has("ADMINISTRATOR")) {
            CuratorModel.deleteOne({
                user_id: id
            }, function(err, res) {
                if (!err) {
                    if (res.n > 0) {
                        return message.channel.send('User deleted')
                    } else {
                        return message.channel.send('Sorry user not found !')
                    }
                } else {
                    return message.channel.send('Error ! Please try again')
                }
            })
        } else {
            return message.channel.send("Sorry you are not allowed to use this function. Please contact a moderator or the server admin.")
        }
    },

    displayRoleUser: function(id, message) {
        CuratorModel.findOne({
            user_id: id
        }, function(err, res) {
            if (!err) {
                if (res === null) {
                    return message.channel.send("User not found !")
                } else {
                    var role = res.role;
                    return message.channel.send("Role : " + role);
                }
            } else {
                console.log("Error : " + err)
                return message.channel.send("Error please try again !")
            }
        })
    },

    updateRoleUser: function(id, username, message) {
        CuratorModel.findOne({
            user_id: id
        }, function(err, res) {
            if (!err) {
                if (res === null) {
                    return message.channel.send("User not found ! ")
                } else {
                    if (res.role === "community") {
                        role = "general"
                    } else {
                        role = "community"
                    }
                    CuratorModel.update({
                        user_id: res.user_id
                    }, {
                        role: role,
                    }, {
                        upsert: false
                    }, function(err, res) {
                        if (err) {
                            console.log("--------------- Error : " + err)
                        } else {
                            return message.channel.send("Role from " + username + " updated !")
                        }
                    })
                }
            } else {
                console.log("--------------- Error :" + err)
            }
        });
    },
}
