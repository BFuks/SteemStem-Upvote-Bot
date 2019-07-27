const steem = require("steem")


module.exports = {
	resteem: (wif, account, author, permlink) => {
		const json = JSON.stringify(['reblog', {
			account,
			author,
			permlink
		}])
		
		/*const data = {
			id: 'follow',
			json,
			required_auths: [],
			required_posting_auths: [account],
		}*/

		return new Promise((resolve, reject) => {
			steem.broadcast.customJson(wif, [], [account], 'follow', json, (err, result) => {
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
