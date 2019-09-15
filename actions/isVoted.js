const Discord = require("discord.js");
const steem = require("steem");

module.exports =
{
  isVoted: function(author, permlink, voter)
  {
    return new Promise((resolve, reject) => {
      steem.api.getContent(author, permlink, function(err, res)
      {
        if (err) { reject('------ Error promise isVoted!'); }
        else
        {
          var voters = res.active_votes;
          var ArVoters = []
          voters.forEach(function(element) { if (element.voter === voter) { ArVoters.push(element.voter) } });
          setTimeout(function()
          {
            if (ArVoters.length > 0) { resolve(false); }
            else { resolve(true); }
          }, 1500);
        }
      });
    });
  }
}
