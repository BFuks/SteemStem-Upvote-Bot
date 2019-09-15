const steem = require("steem");

module.exports =
{
  upvote: function(wif, voter, author, permlink, weight, skip=false)
  {
    return new Promise((resolve, reject) => {
      if(skip)      { console.log('     -> already voted...'); return resolve(true); }
      if(weight==0) { console.log('     -> weight is zero.'); return resolve(true); }
      steem.broadcast.vote(wif, voter, author, permlink, weight, function(err, result)
      {
        if (err) { console.log('------ Error: ', err); reject(err); }
        else     { console.log(`     -> VOTE from @${voter} sent (`, weight/100,'%)'); resolve(true); }
      });
    });
  }
}
