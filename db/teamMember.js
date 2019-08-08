const Discord = require('discord.js')
const config = require('./../config.json')
const steem = require('steem')

// var bot = new Discord.Client()
var mongoose = require('mongoose')


// Connect to DB
mongoose.connect(config.db_url)

// Connect to the Bot
// bot.login(config.token);


var TeamMemberSchema = require('./teamMemberSchema.js')
var TeamMemberModel = mongoose.model('team_members', TeamMemberSchema.TeamMemberSchema)

module.exports = {

  add: function(usernames, message) {
    TeamMemberModel.find({username: {$in: usernames}}, (err, res) => {
      if (err) {
        console.log("Error: " + err)
        return message.channel.send('Error! Try again: ')
      }
      console.log(res)
      users = usernames.filter(user => !res.find(member => member.username === user))

      if (users.length === 0) {
        return message.channel.send("No. User(s) already registered as part of the Steemstem's team")
      }
      
      var members = []
      for (user of users) {
        var teamMember = new TeamMemberModel()
        teamMember.username = user.toLowerCase()
        teamMember.role = 'none' //temporary
        members.push(teamMember)
      }
      TeamMemberModel.collection.insertMany(members, (err, res) => {
        if (err) {
          console.log('Error: ' + err)
          return message.channel.send("Error when inserting the new member(s) into the DB. Try again")
        } else {
          console.log("Team member(s) inserted: " + res.insertedCount)
          return message.channel.send("New team member(s) inserted: " + users)
        }
      })
    })
  },

  remove: function(usernames, message) {
    TeamMemberModel.deleteMany({ username: usernames }, (err, res) => {
      if (err) {
        return message.channel.send('Error! Please try again')
      } 
      if (res.n > 0) {
        return message.channel.send('OK. Steem account(s) removed from the team members')
      } else {
        return message.channel.send('Sorry, Steem account(s) not found!')
      }
    })
  },
}