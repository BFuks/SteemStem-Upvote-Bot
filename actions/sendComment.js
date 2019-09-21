const Discord = require("discord.js");
const steem = require("steem");
const config = require("./../config.json");

var CheckComment = require('./isComment.js');

module.exports =
{
  sendComment: function(author, permlink, value1, value2, message, isBenef, isStemApp)
  {
    var wif       = config.bot_comment[0].wif;
    var admin     = config.bot_comment[0].username;
    var permlink2 = steem.formatter.commentPermlink(author, permlink);
    if (value2 === 0) { content = comment1; }
    else              { content = comment2; }

    if     (isBenef && isStemApp) { content = content + BnfAppLine; }
    else if(isBenef)              { content = content + BnfLine;    }
    else if(isStemApp)            { content = content + AppLine;    }
    else                          { content = content + NotLine;    }

    CheckComment.isComment(author, permlink).then(function(val)
    {
      if (val)
      {
        steem.broadcast.comment(wif, author, permlink, admin, permlink2, permlink2, content, '{"app":"bloguable-bot"}', function(err, result)
        {
          if (!err && result) { return message.channel.send("Finished ! Successful operation.") }
          else { console.log("Error when sending the comment !"); return message.channel.send("Error when sending the comment. "); }
        })
      }
    }).catch(function(err) { console.log("Error when sending the comment: " + err) });
  }
} // End module

//SteemStem
var comment1 = "<div class='text-justify'> <div class='pull-left'> <center> <img width='200' src='https://res.cloudinary.com/drrz8xekm/image/upload/v1553698283/weenlqbrqvvczjy6dayw.jpg'> </center>  <br/> </div> \n\nThis post has been voted on by the **SteemSTEM curation team** and voting trail. It is elligible for support from @minnowbooster.<br /> \n\nIf you appreciate the work we are doing, then consider supporting our witness [@stem.witness](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=stem.witness)! <br /> \n\nFor additional information please join us on the [SteemSTEM discord]( https://discord.gg/BPARaqn) and to get to know the rest of the community!<br />\n\n"

//SteemStem + Curie
var comment2 = "<div class='text-justify'> <div class='pull-left'> <center> <br /> <img width='200' src='https://res.cloudinary.com/drrz8xekm/image/upload/v1553698283/weenlqbrqvvczjy6dayw.jpg'> </center>  <br/> </div> \n\nThis post has been voted on by the **SteemSTEM curation team** and voting trail. It is elligible for support from @curie and @minnowbooster.<br /> \n\nIf you appreciate the work we are doing, then consider supporting our witness [@stem.witness](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=stem.witness). Additional witness support to the [curie witness](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=curie) would be appreciated as well.<br /> \n\nFor additional information please join us on the [SteemSTEM discord]( https://discord.gg/BPARaqn) and to get to know the rest of the community!<br />\n\n"

// Beneficiary + app
var BnfAppLine = "Thanks for having used the <a href='https://www.steemstem.io'>steemstem.io</a> app and included @steemstem in the list of beneficiaries of this post. This granted you a stronger support from SteemSTEM.";

// Beneficiary + only
var BnfLine = "Thanks for having included @steemstem in the list of beneficiaries of this post. This granted you a stronger support from SteemSTEM. Note that using the <a href='https://www.steemstem.io'>steemstem.io</a> app could have yielded an even more important support.";

// App only
var AppLine = "Thanks for having used the <a href='https://www.steemstem.io'>steemstem.io</a> app. This granted you a stronger support from SteemSTEM. Note that including @steemstem in the list of beneficiaries of this post could have yielded an even more important support.";

// Nothing
var NotLine = "Please consider using the <a href='https://www.steemstem.io'>steemstem.io</a> app and/or including @steemstem in the list of beneficiaries of this post. This could yield a stronger support from SteemSTEM."
