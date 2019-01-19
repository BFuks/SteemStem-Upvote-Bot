const steem = require("steem");
const config = require("./../config.json");

var mongoose = require('mongoose');
var CuratorSchema = require('./../db/curatorSchema.js')

var CuratorModel = mongoose.model('curators', CuratorSchema.CuratorSchema);

var Vote = require('./upvote.js');
var isVote = require('./isVoted.js');
var Comment = require('./sendComment.js')
mongoose.connect(config.db_url);

var community_value = 5;
var general_value = 100;
var voters = config.voters;

module.exports =
{
  sendVote: function(message, value1, value2, author, permlink)
  {
    // Value1 = SteemStem Value2 = Curie
    id = message.author.id
    CuratorModel.findOne({ user_id: id }, function(err, res)
    {
      if (res === null)
        { return message.channel.send("Access denied.") }
      else
      {
        var role = res.role;
        parseInt(value1)
        parseInt(value2)

        // community
        if (role === 'community')
        {
          if (value1 >= 0 && value1 <= community_value)
          {
            if (value2 >= 0 && value2 <= community_value)
            {
              if (value1 > 0)
              {
                // check if the publication exists
                author1 = author.substring(1, author.length)
                steem.api.getContent(author1, permlink, function(err, result)
                {
                  if (err) { return message.channel.send("Error ! Please try again !") } 
                  else
                  {
                    if (result.author.length > 0 && result != undefined)
                    {
                      // Send vote ! 
                      isVote.isVoted(author1, permlink, voters[0].username)
                        .then(function(val)
                        {
                          if (val)
                          {
                            if(on_ssio.app=='steemstem')
                            {
                              message.channel.send("This post has been posted on steemstem.io --> 5% bonus upvote (" + Math.min(100,parseInt(value1)+5) + "/"+value2+" instead of " +value1 + "/" + value2 + ")")
                              value1 = Math.min(100,parseInt(value1)+5)
                            }
                            var weight1 = parseInt(value1) * 100
                            Vote.upvote(voters[0].wif, voters[0].username, author1, permlink, weight1)
                              .then(function(val)
                              {
                                message.channel.send("Upvote from @" + voters[0].username + " done :white_check_mark:")
                                if (value2 > 0)
                                {
                                  isVote.isVoted(author1, permlink, voters[1].username)
                                    .then(function(val)
                                    {
                                      if (val)
                                      {
                                        var weight2 = parseInt(value2) * 100
                                        Vote.upvote(voters[1].wif, voters[1].username, author1, permlink, weight2)
                                          .then(function(val)
                                          {
                                            if (val)
                                            {
                                              //Send comment
                                              message.channel.send("Upvote from @" + voters[1].username + " done :white_check_mark:")
                                              message.channel.send("Sending comment...")
                                              return Comment.sendComment(author1, permlink, value1, value2, message)
                                            }
                                            else { console.log("No val from @dna-replication upvote !") }
                                          }).catch(function(err) { console.log("Error : " + err); return message.channel.send("Error in upvote dna replication") ; })
                                      }
                                      else { message.channel.send("Already upvoted by @" + voters[1].username) }
                                    }).catch(function(err) { return message.channel.send("Error in is voted dna-replication !") })
                                }
                                else
                                {
                                  // Send comment
                                  message.channel.send("Sending comment...")
                                  return Comment.sendComment(author1, permlink, value1, value2, message)
                                }
                              }).catch(function(err) { return message.channel.send("Error with @steemstem upvote !") })
                          }
                          else { return message.channel.send("Already upvoted !") }
                        }).catch(function(err) { console.log("Error : " + err); return message.channel.send("Error please try again !") })
                    }
                    { return message.channel.send("Invalid url !") }
                  }
                })
              }
            }
            else { return message.channel.send("Value from Curie not valid. Your limit is 5%") }
          }
          else { return message.channel.send("Value from Steemstem not valid. Your limit is 5%") }
        }

        // general
        else if (role === 'general')
        {
          if (value1 > 0 && value1 <= general_value)
          {
            if (value2 >= 0 && value2 <= general_value)
            {
              author1 = author.substring(1, author.length)
              steem.api.getContent(author1, permlink, function(err, result)
              {
                if (err) { return message.channel.send("Error ! Please try again !") }
                else
                {
                  if (result.author.length > 0 && result != undefined)
                  {
                    var on_ssio = JSON.parse(result.json_metadata)
                    // Send vote !
                    isVote.isVoted(author1, permlink, voters[0].username)
                      .then(function(val)
                      {
                        if (val)
                        {
                          if(on_ssio.app=='steemstem')
                          {
                            message.channel.send("This post has been posted on steemstem.io --> 5% bonus upvote (" + Math.min(100,parseInt(value1)+5) + "/"+value2+" instead of " +value1 + "/" + value2 + ")")
                            value1 = Math.min(100,parseInt(value1)+5)
                          }
                          var weight1 = parseInt(value1) * 100
                          Vote.upvote(voters[0].wif, voters[0].username, author1, permlink, weight1)
                            .then(function(val)
                            {
                              message.channel.send("Upvote from @" + voters[0].username + " done :white_check_mark:")
                              if (value2 > 0)
                              {
                                                                isVote.isVoted(author1, permlink, voters[1].username)
                                                                    .then(function(val) {
                                                                        if (val) {
                                                                            var weight2 = parseInt(value2) * 100
                                                                            Vote.upvote(voters[1].wif, voters[1].username, author1, permlink, weight2)
                                                                                .then(function(val) {
                                                                                    if (val) {
                                                                                        //Send comment
                                                                                        message.channel.send("Upvote from @" + voters[1].username + " done :white_check_mark:")
                                                                                        message.channel.send("Sending comment...")
                                                                                        return Comment.sendComment(author1, permlink, value1, value2, message)
                                                                                    } else {
                                                                                        return console.log("No val from @dna-replication upvote !")
                                                                                    }
                                                                                }).catch(function(err) {
                                                                                    console.log("Error : " + err)
                                                                                    return message.channel.send("Error in upvote dna replication")
                                                                                })
                                                                        } else {
                                                                            message.channel.send("Already upvoted by @" + voters[1].username)
                                                                        }
                                                                    }).catch(function(err) {
                                                                        return message.channel.send("Error in is voted dna-replication !")
                                                                    })
                                                            } else {
                                                                // Send comment
                                                                message.channel.send("Sending comment...")
                                                                return Comment.sendComment(author1, permlink, value1, value2, message)
                                                            }
                                                        }).catch(function(err) {
                                                            return message.channel.send("Error with @steemstem upvote !")
                                                        })
                                                } else {
                                                    return message.channel.send("Already upvoted !")
                                                }
                                            }).catch(function(err) {
                                                console.log("Error : " + err)
                                                return message.channel.send("Error please try again !")
                                            })
                                    } else {
                                        return message.channel.send("Invalid url !")
                                    }
                                }
                            })
                        } else {
                            return message.channel.send("Value from Curie not valid. Limit is 100% ")
                        }
                    } else {
                        return message.channel.send("Value from Steemstem not valid. Limit is 100% or > 0%")
                    }
                }
            }
        })
    }

} // End module
