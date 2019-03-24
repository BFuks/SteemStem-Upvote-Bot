const Discord = require("discord.js");
const steem = require("steem");
const config = require("./../config.json");

var CheckComment = require('./isComment.js');

module.exports = {
    sendComment: function(author, permlink, value1, value2, message, isBenef, isStemApp) {
        console("en sendComment:", isBenef, isStemApp)
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
var comment1 = "<div class='text-justify'> <div class='pull-left'> <br /> <center> <img width='125' src='https://i.postimg.cc/TYfM2BBG/rocket_small.png'> </center>  <br/> </div> <br /> \n\n This post has been voted on by the **SteemSTEM** curation team and voting trail. <br /> \nIf you appreciate the work we are doing then consider [voting](https://www.steemit.com/~witnesses) us for witness by selecting [**stem.witness**](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=stem.witness)! <br /> \n For additional information please join us on the [**SteemSTEM discord**]( https://discord.gg/BPARaqn) and to get to know the rest of the community! </div>"
//SteemStem + Curie
var comment2 = "<div class='text-justify'> <div class='pull-left'> <br /> <center> <img width='125' src='https://i.postimg.cc/9FwhnG3w/steemstem_curie.png'> </center>  <br/> </div> <br /> <br /> \n\n This post has been voted on by the **SteemSTEM** curation team and voting trail in collaboration with **@curie**. <br /> \n If you appreciate the work we are doing then consider [voting](https://www.steemit.com/~witnesses) both projects for witness by selecting [**stem.witness**](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=stem.witness) and [**curie**](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=curie)! <br /> \nFor additional information please join us on the [**SteemSTEM discord**]( https://discord.gg/BPARaqn) and to get to know the rest of the community! </div>"
// SteemStem + Utopian
var comment3 = "<div class='text-justify'> <div class='pull-left'> <br /> <center> <img width='125' src='https://i.postimg.cc/Bbrkt9rf/steemstem_utopian2.png'> </center> <br />  </div> <br /> <br /> \n\n This post has been voted on by the **SteemSTEM** curation team and voting trail in collaboration with **@utopian-io**.  <br /> \n If you appreciate the work we are doing then consider [voting](https://www.steemit.com/~witnesses) both projects for witness by selecting [**stem.witness**](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=stem.witness) and [**utopian-io**](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=utopian-io)! <br /> \n For additional information please join us on the [**SteemSTEM discord**]( https://discord.gg/BPARaqn) and to get to know the rest of the community! </div>"
// Curie + Utopian + SteemStem
var comment4 = "<div class='text-justify'> <div class='pull-left'> <br /> <center> <img width='125' src='https://i.postimg.cc/Gtd18f7W/steemstem_curie_utopian.png'> </center> <br /> </div> <br /> <br /> \n\n This post has been voted on by the **SteemSTEM** curation team and voting trail in collaboration with **@utopian-io** and **@curie**. <br /> \n If you appreciate the work we are doing then consider [voting](https://steemit.com/~witnesses) all three projects for witness by selecting [**stem.witness**](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=stem.witness), [**utopian-io**](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=utopian-io) and [**curie**](https://steemconnect.com/sign/account_witness_vote?approve=1&witness=curie)! <br /> \n For additional information please join us on the [**SteemSTEM discord**]( https://discord.gg/BPARaqn) and to get to know the rest of the community! </div>"

var isBeneficiaryComment = ""
var isNotBeneficiaryComment = ""
var isStemAppComment = ""
var isNotStemAppComment = ""