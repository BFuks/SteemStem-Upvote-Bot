const Discord = require("discord.js");
const steem = require("steem");
const config = require("./../config.json");

var CheckComment = require('./isComment.js');

module.exports = {
    sendComment: function(author, permlink, value1, value2, message, isBenef, isStemApp) {
        var wif = config.bot_comment[0].wif;
        var admin = config.bot_comment[0].username;
        var permlink2 = steem.formatter.commentPermlink(author, permlink);
        value1 = parseInt(value1)
        value2 = parseInt(value2)
        if (value1 <= 50 && value2 === 0) {
            content = comment1
        }
        if (value1 <= 50 && value2 <= 50 && value2 > 0) {
            content = comment2
        }
        if (value1 > 50 && value2 === 0) {
            content = comment3
        }
        if (value1 > 50 && value2 > 50 && value2 > 0) {
            content = comment4
        }

        content = isBenef ? content + isBeneficiaryComment : content + isNotBeneficiaryComment
        content = isStemApp ? content + isStemAppComment : content + isNotStemAppComment
        
        CheckComment.isComment(author, permlink)
            .then(function(val) {
                if (val) {
                    steem.broadcast.comment(wif, author, permlink, admin, permlink2, permlink2, content, '{"app":"bloguable-bot"}', function(err, result) {
                        if (!err && result) {
                            // Send value of total voters of the trail in the discord channel
                            return message.channel.send("Finished ! Successful operation.")
                        } else {
                            console.log("Error when sending the comment !")
                            return message.channel.send("Error when sending the comment. ")
                        }
                    })
                }
            }).catch(function(err) {
                console.log("Error : " + err)
            })
    }

} // End module

//SteemStem
var comment1 = "<div class='text-justify'> <div class='pull-left'> <center> <img width='200' src='https://res.cloudinary.com/drrz8xekm/image/upload/v1553698283/weenlqbrqvvczjy6dayw.jpg'> </center>  <br/> </div> \n\nThis post has been voted on by the **SteemSTEM** curation team and voting trail. <br /> \n\nIf you appreciate the work we are doing, then consider supporting our witness [**stem.witness**](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=stem.witness)! <br /> \n\nFor additional information please join us on the [**SteemSTEM discord**]( https://discord.gg/BPARaqn) and to get to know the rest of the community!<br />\n\n"
//SteemStem + Curie
var comment2 = "<div class='text-justify'> <div class='pull-left'> <center> <br /> <img width='200' src='https://res.cloudinary.com/drrz8xekm/image/upload/v1553698283/weenlqbrqvvczjy6dayw.jpg'> </center>  <br/> </div> \n\nThis post has been voted on by the **SteemSTEM** curation team and voting trail. It is elligible for support from <b><a href='https://www.steemstem.io/#!/@curie'>@curie</a></b>.<br /> \n\nIf you appreciate the work we are doing, then consider supporting our witness [**stem.witness**](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=stem.witness). Additional witness support to the [**curie witness**](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=curie) would be appreciated as well.<br /> \n\nFor additional information please join us on the [**SteemSTEM discord**]( https://discord.gg/BPARaqn) and to get to know the rest of the community!<br />\n\n"
// SteemStem + Utopian
var comment3 = comment1;
// Curie + Utopian + SteemStem
var comment4 = comment2;


var isBeneficiaryComment = "Thanks for having added <b><a href='https://www.steemstem.io/#!/@steemstem'>@steemstem</a></b> as a beneficiary to your post. This granted you a stronger support from SteemSTEM.<br />\n\n"
var isNotBeneficiaryComment = "Please consider setting <b><a href='https://www.steemstem.io/#!/@steemstem'>@steemstem</a></b> as a beneficiary to your post to get a stronger support.<br />\n\n"
var isStemAppComment = "Thanks for having used the <b><a href='https://www.steemstem.io'>steemstem.io</a></b> app. You got a stronger support!</div>"
var isNotStemAppComment = "Please consider using the <b><a href='https://www.steemstem.io'>steemstem.io</a></b> app to get a stronger support.</div>"
