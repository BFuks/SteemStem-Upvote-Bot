const steem = require("steem")


module.exports = {
	resteem: (wif, myaccount, myauthor, mypermlink) => {
		const json = JSON.stringify(['reblog', {
			account:  myaccount,
			author:   myauthor,
			permlink: mypermlink
		}])
		
		/*const data = {
			id: 'follow',
			json,
			required_auths: [],
			required_posting_auths: [account],
		}*/

		return new Promise((resolve, reject) => {
			steem.broadcast.customJson(wif, [], [myaccount], 'follow', json, (err, result) => {
			// steem.broadcast.json(data, wif, (err, result) => {
				if (err) {
					console.log("Error: " + err)
					reject(err)
				} else {
					console.log("Resteemed")
					resolve(true)
				}
			})

		})
	}	
} // End module
