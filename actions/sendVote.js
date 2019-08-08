const steem = require('steem')
const config = require('./../config.json')

var mongoose = require('mongoose')

var CuratorSchema = require('./../db/curatorSchema.js')
var CuratorModel = mongoose.model('curators', CuratorSchema.CuratorSchema)

var SteemitMemberSchema = require('./../db/steemitMemberSchema.js')
var SteemitMemberModel = mongoose.model('steemit_members', SteemitMemberSchema.SteemitMemberSchema)

var Vote = require('./upvote.js')
var isVote = require('./isVoted.js')
var Comment = require('./sendComment.js')
var Resteem = require('./sendResteem.js')
mongoose.connect(config.db_url)

var community_value = 5
var general_value = 100
var voters = config.voters

module.exports =
{
  sendVote: function(message, value1, value2, author, permlink)
  {
    // Value1 = SteemStem Value2 = Curie
    id = message.author.id
    CuratorModel.findOne({ user_id: id }, function(err, res)
    {
      if (err) 
      {
      	console('Error with mongod on CuratorModel')
      	return message.channel.send('Error ! Please try again !')
      }
      if (res == null) 
      {
      	return message.channel.send('Access denied.') 
      }
      else
      {
        var role = res.role
        parseInt(value1)
        parseInt(value2)

        SteemitMemberModel.findOne({
            username: author.replace('@', '').toLowerCase()
        }, function (err, res) {
          if (err) {
          	return message.channel.send('Error ! Please try again !')
          }
          
          if (res != null && res.list === 'blacklist') {
          	return message.channel.send('Sorry, this user is blacklisted.')
          }

          if (role === 'community') {
            if (value1 >= 0 && value1 <= community_value) {
              if (value2 >= 0 && value2 <= community_value) {

              	if (value1 > 0) {
                  // check if the publication exists
                  author1 = author.substring(1, author.length)
                  steem.api.getContent(author1, permlink, function(err, result) {
                  	if (err) {
                  	  return message.channel.send("Error ! Please try again !")
                  	} else {
                  	  if (result.author.length > 0 && result != undefined) {
                  	  	var on_ssio = JSON.parse(result.json_metadata)
                        var is_benef = false
                        var bnf_val = 0
                        if(result.beneficiaries)
                        {
                          for (bnf=0; bnf<result.beneficiaries.length; bnf+=1)
                          { 
                            if(result.beneficiaries[bnf].account=='steemstem') { is_benef = true; bnf_val = parseInt(result.beneficiaries[bnf].weight)/100; } 
                          }
                        }
                        bnf_val = Math.min(bnf_val,5)
                  	  	// Send vote ! 
                  	  	isVote.isVoted(author1, permlink, voters[0].username)
                  	  	  .then(function(val) {
                  	  	  	if (val) {
                              isStemApp = on_ssio.app =='steemstem'
                  	  	  	  if(isStemApp)
                  	  	  	  {
                                            if(parseInt(value1)<50)
                                            {
                  	  	  	  	message.channel.send("This post has been posted on steemstem.io --> 5% bonus upvote (" + Math.min(49,parseInt(value1)+5) + "/"+value2+" instead of " +value1 + "/" + value2 + ")")
                  	  	  	  	value1 = Math.min(49,parseInt(value1)+5)
                                            }
                                            else
                                            {
                  	  	  	  	message.channel.send("This post has been posted on steemstem.io --> 5% bonus upvote (" + Math.min(100,parseInt(value1)+5) + "/"+value2+" instead of " +value1 + "/" + value2 + ")")
                  	  	  	  	value1 = Math.min(100,parseInt(value1)+5)
                                            }
                  	  	  	  }
          	  	  	  	      if(is_benef)
          	  	  		        {
                                            if(parseInt(value1)<50)
                                            {
                  	  	  	  	message.channel.send("This post includes steemstem as a beneficiary --> " + bnf_val +  "% bonus upvote (" + Math.min(49,parseInt(value1)+bnf_val) + "/"+value2+" instead of " +value1 + "/" + value2 + ")")
                  	  	  	  	value1 = Math.min(49,parseInt(value1)+bnf_val)
                                            }
                                            else
                                            {
                  	  	  	  	message.channel.send("This post includes steemstem as a beneficiary --> " + bnf_val +  "% bonus upvote (" + Math.min(100,parseInt(value1)+bnf_val) + "/"+value2+" instead of " +value1 + "/" + value2 + ")")
          	  	  		  	      value1 = Math.min(100,parseInt(value1)+bnf_val)
                                            }
          	  	  		        }
                  	  	  	  var weight1 = parseInt(value1) * 100
                  	  	  	  Vote.upvote(voters[0].wif, voters[0].username, author1, permlink, weight1)
                  	  	  	    .then(function(val) {
                  	  	  	      message.channel.send("Upvote from @" + voters[0].username + " done :white_check_mark:")
                  	  	  	      if (value2 > 0) {
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
                                            //Try resteem (not necessary since it's a community curator):
                                            // Resteem.sendResteem(message, author1, permlink, value1)
                  	  	  	      	  	  	return Comment.sendComment(author1, permlink, value1, value2, message,  is_benef, isStemApp)
                  	  	  	      	  	  } else {
                  	  	  	      	  	  	console.log("No val from @dna-replication upvote !")
                  	  	  	      	  	  }
                  	  	  	      	  	}).catch(function(err) {
                  	  	  	      	  		console.log("Error : " + err)
                  	  	  	      	  		return message.channel.send("Error in upvote dna replication")
                  	  	  	      	  	})
                  	  	  	      	  } else {
                  	  	  	      	  	message.channel.send("Already upvoted by @" + voters[1].username)
                  	  	  	      	  }
                  	  	  	      	}).catch(function(err) {
                                        console.log("Error : " + err)
                  	  	  	      	    return message.channel.send("Error in is voted dna-replication !")
                  	  	  	      	})
                  	  	  	      } else {
                  	  	  	        // Send comment
                  	  	  	        message.channel.send("Sending comment...")
                                    //Try resteem (not necessary since it's a community curator):
                                    //Resteem.sendResteem(message, author1, permlink, value1)
                  	  	  	        return Comment.sendComment(author1, permlink, value1, value2, message, is_benef, isStemApp)
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
                }
              } else {
              	return message.channel.send("Value from Curie not valid. Your limit is 5%")
              }
            } else {
              return message.channel.send("Value from Steemstem not valid. Your limit is 5%")
            }

          } else if (role === 'general') {
          	if (value1 > 0 && value1 <= general_value) {
          	  if (value2 >= 0 && value2 <= general_value) {
          	  	author1 = author.substring(1, author.length)
          	  	steem.api.getContent(author1, permlink, function(err, result) {
          	  	  if (err) {
          	  	  	return message.channel.send("Error ! Please try again !")
          	  	  } else {
          	  	  	if (result.author.length > 0 && result != undefined) {
          	  	  	  var on_ssio = JSON.parse(result.json_metadata)
                      var is_benef = false
                      var bnf_val = 0
                      if(result.beneficiaries)
                      {
                        for (bnf=0; bnf<result.beneficiaries.length; bnf+=1)
                        { 
                          if(result.beneficiaries[bnf].account=='steemstem') { is_benef = true; bnf_val = parseInt(result.beneficiaries[bnf].weight)/100; } 
                        }
                      }
                      bnf_val = Math.min(bnf_val,5)
          	  	  	  // Send vote ! 
          	  	  	  isVote.isVoted(author1, permlink, voters[0].username)
          	  	  	  .then(function(val) {
          	  	  	  	if (val) {
                          isStemApp = on_ssio.app =='steemstem'
          	  	  	  	  if(isStemApp)
          	  	  		    {
                            if(parseInt(value1)<50)
                            {
                              message.channel.send("This post has been posted on steemstem.io --> 5% bonus upvote (" + Math.min(49,parseInt(value1)+5) + "/"+value2+" instead of " +value1 + "/" + value2 + ")")
                              value1 = Math.min(49,parseInt(value1)+5)
                            }
                            else
                            {
          	  	  		  	     message.channel.send("This post has been posted on steemstem.io --> 5% bonus upvote (" + Math.min(100,parseInt(value1)+5) + "/"+value2+" instead of " +value1 + "/" + value2 + ")")
          	  	  		  	     value1 = Math.min(100,parseInt(value1)+5)
                             }
          	  	  		    }
          	  	  	  	  if(is_benef)
          	  	  		    {
                            if(parseInt(value1)<50)
                            {
                              message.channel.send("This post includes steemstem as a beneficiary --> " + bnf_val +  "% bonus upvote (" + Math.min(49,parseInt(value1)+bnf_val) + "/"+value2+" instead of " +value1 + "/" + value2 + ")")
                              value1 = Math.min(49,parseInt(value1)+bnf_val)
                            }
                            else
                            {
                              message.channel.send("This post includes steemstem as a beneficiary --> " + bnf_val +  "% bonus upvote (" + Math.min(100,parseInt(value1)+bnf_val) + "/"+value2+" instead of " +value1 + "/" + value2 + ")")
          	  	  		  	    value1 = Math.min(100,parseInt(value1)+bnf_val)
                            }
          	  	  		    }
          	  	  		  var weight1 = parseInt(value1) * 100
          	  	  		  Vote.upvote(voters[0].wif, voters[0].username, author1, permlink, weight1)
          	  	  		  .then(function(val) {
          	  	  		    message.channel.send("Upvote from @" + voters[0].username + " done :white_check_mark:")
          	  	  		  	if (value2 > 0) {
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
                                    //Try resteem:
                                    Resteem.sendResteem(message, author1, permlink, value1)
          	  	  		  	  	  	  return Comment.sendComment(author1, permlink, value1, value2, message, is_benef, isStemApp)
          	  	  		  	  	  	} else {
          	  	  		  	  	  	  return console.log("No val from @dna-replication upvote !")
          	  	  		  	  	  	}
          	  	  		  	  	  }).catch(function(err) {
          	  	  		  	  	    console.log("Error : " + err)
          	  	  		  	  	    return message.channel.send("Error in upvote dna replication")
          	  	  		  	  	  })
          	  	  		  	  	} else {
          	  	  		  	  	  essage.channel.send("Already upvoted by @" + voters[1].username)
          	  	  		  	  	}
          	  	  		  	  }).catch(function(err) {
          	  	  		  	    return message.channel.send("Error in is voted dna-replication !")
          	  	  		  	  })
          	  	  		  	} else {
                            //Try resteem:
                            Resteem.sendResteem(message, author1, permlink, value1)
          	  	  		  	  // Send comment
          	  	  		  	  message.channel.send("Sending comment...")
          	  	  		  	  return Comment.sendComment(author1, permlink, value1, value2, message, is_benef, isStemApp)
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
        })
	  }
    })
  }
} // End module
