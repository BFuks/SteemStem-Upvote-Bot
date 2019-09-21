// Configurations
const steem = require('steem');
const config = require('./../config.json');

// Database
var mongoose = require('mongoose');
mongoose.connect(config.db_url);
var CuratorSchema = require('./../db/curatorSchema.js');
var CuratorModel = mongoose.model('curators', CuratorSchema.CuratorSchema);
var SteemitMemberSchema = require('./../db/steemitMemberSchema.js');
var SteemitMemberModel = mongoose.model('steemit_members', SteemitMemberSchema.SteemitMemberSchema);

// Methods
var Vote = require('./upvote.js');
var isVote = require('./isVoted.js');
var Comment = require('./sendComment.js');
var Resteem = require('./sendResteem.js');

// Variables
var community_value = 65;
var general_value = 100;
var voters = config.voters;

module.exports =
{
  sendVote: function(message, value1, value2, author, permlink)
  {
//    CuratorModel.update( { user_id: '123456789012345667'}, {role: 'community'}, {upsert: false}, function(err, res)
//    {
//      if (!err) { console.log('Error!', err); return; }
//      else { console.log('Alright!'); return; }
//    });
//    console.log(' ');

    console.log('sendVote: Preparing the send a new vote');
    id = message.author.id;
    CuratorModel.findOne({ user_id: id }, function(err, res)
    {
      // Various checks
      if (err)  { console('Error with mongoDB on CuratorModel'); return message.channel.send('Error ! Please try again !'); }
      if (res == null)  { return message.channel.send('Access denied.'); }

      // Everything is fine
      var role = res.role;
      console.log(' ** sendVote: voting role = ',role);
      value1 = parseInt(value1);
      value2 = parseInt(value2);
      console.log(' ** sendVote: vote value = ', value1, value2);

      // Checking the black list
      SteemitMemberModel.findOne({ username: author.replace('@', '').toLowerCase() }, function (error, result)
      {
        if (error) { return message.channel.send('Error ! Please try again !'); }
        if (result != null && result.list === 'blacklist') { return message.channel.send('Sorry, this user is blacklisted.'); }
      });

      // Checking vote value
      let allowed = false;
      if (role === 'community') { allowed = (value1>=0) && (value1<=community_value) && (value2>=0) && (value2<=community_value); }
      if (role === 'general')   { allowed = (value1>=0) && (value1<=general_value)   && (value2>=0) && (value2<=general_value);   }
      console.log(' ** sendVote: post allowed: ', allowed);
      if(!(value1>0 || value2>0)) { return message.channel.send('At least one of the two vote values should be positive'); }
      if(!allowed) { return message.channel.send('Invalid vote values'); }

      // Checking whether the article exist and getting its properties
      author = author.substring(1, author.length);
      console.log(' ** sendVote: author: ', author, '; permlink: ', permlink);
      steem.api.getContent(author, permlink, function(error, result)
      {
        // error
        if(error) { return message.channel.send("Cannot find the post! Please try again !"); }
        if(!result || result.author.length==0) { return message.channel.send("Cannot find the post! Please try again !"); }

        // General post information
        let metadata = JSON.parse(result.json_metadata);
        let use_app  = (metadata.app =='steemstem');
        console.log(' ** sendVote: is using the app:', use_app);
        // Beneficiary information
        let is_beneficiary = false;
        let beneficiary_value = 0;
        if(result.beneficiaries)
        {
          for (let bnf=0; bnf<result.beneficiaries.length; bnf+=1)
            { if(result.beneficiaries[bnf].account=='steemstem') { is_beneficiary = true; beneficiary_value = parseInt(result.beneficiaries[bnf].weight)/100; } }
        }
        beneficiary_value = Math.min(beneficiary_value,5);

        // Updating the vote values
        if(use_app)
        {
          message.channel.send(" --> Bonus for using steemstem.io: " + Math.min(100,value1+5) + "% @steemstem upvote (instead of " +value1 + "%).");
          value1 = Math.min(100,value1+5);
        }
        if(is_beneficiary)
        {
          message.channel.send(" --> Bonus for including @steemstem as a beneficiary: " + Math.min(100,value1+beneficiary_value) + "% @steemstem upvote (instead of " +value1 + "%).");
          value1 = Math.min(100,value1+beneficiary_value);
        }


            // Sending vote with steemstem-trig
            isVote.isVoted(author, permlink, voters[0].username).then(function(val)
            {
              console.log(' ** sendVote new voter:', voters[0].username, '  (has already voted:', !val,')');
              Vote.upvote(voters[0].wif, voters[0].username, author, permlink, 100*value1, skip=!val).then(function(val)
              {
                now = new Date().getTime(); if(!val) { while(new Date().getTime() < now + 45000){  } }
                // Upvote with steemstem
                isVote.isVoted(author, permlink, voters[1].username).then(function(val)
                {
                  let is_done = !val;
                  console.log(' ** sendVote new voter:', voters[1].username, '  (has already voted:', !val,')');
                  Vote.upvote(voters[1].wif, voters[1].username, author, permlink, 100*value1,skip=!val).then(function(val)
                  {
                    if(!is_done) { message.channel.send("Upvote from @" + voters[1].username + " done :white_check_mark:"); }
                    else         { message.channel.send("Already upvoted... skipping!  :x: "); }
                    // Upvote with curie
                    isVote.isVoted(author, permlink, voters[2].username).then(function(val)
                    {
                      console.log(' ** sendVote new voter:', voters[2].username, '  (has already voted:', !val,')');
                        Vote.upvote(voters[2].wif, voters[2].username, author, permlink, 100*value2, skip=!val).then(function(val)
                        {
                          if(!is_done && value2>0) { message.channel.send("Upvote from @" + voters[2].username + " done :white_check_mark:") }
                          // Resteem and comment
                          if(!is_done && author!='steemstem')
                          {
                            Resteem.sendResteem(message, author, permlink, value1);
                            message.channel.send("Sending comment...");
                            Comment.sendComment(author, permlink, value1, value2, message, is_beneficiary, use_app);
                          }
                        }).catch(function(myerr) { console.log("Error with the upvote 2: ", myerr); return;});
                    }).catch(function(myerr) { console.log("Error with test-upvote 2: ",  myerr); return;});
                  }).catch(function(myerr) { console.log("Error with the upvote 1: ", myerr); return;});
                }).catch(function(myerr) { console.log("Error with test-upvote 1: ",  myerr); return;});
              }).catch(function(myerr) { console.log("Error with the upvote 0: ", myerr); return;});
            }).catch(function(myerr) { console.log("Error with test-upvote 0: ",  myerr); return;});


      });
    });
  }
}

