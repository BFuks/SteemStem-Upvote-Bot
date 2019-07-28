const steem = require('steem')
const cld = require('cld')
const mongoose = require('mongoose')

const Resteem = require('./resteem')
const config = require('./../config.json')
const voters = config.voters
const TeamMemberSchema = require('./../db/teamMemberSchema.js')
const TeamMemberModel = mongoose.model('team_members', TeamMemberSchema.TeamMemberSchema)


module.exports = {
	sendResteem: (message, author, permlink, value1, value2) => {
		if (value1 < 65 || value2 < 65) {
			console.log('No high enough for a resteem')
			return
		}

		TeamMemberModel.findOne({username: author}, (err, res) => {
			if (err) {
				console.log("Error: " + err)
				return message.channel.send("Error. Try again!")
			}
			if (res !== null) {
				console.log("Can't be resteemed for being a team member account")
				return
			}
			steem.api.getContent(author, permlink, (err, result) => {

			    if (err) {
			     	console.log('Error when requesting the post')
			     	return message.channel.send('Error when requesting the post to determine the language')

			  	} else {
			    	cld.detect(result.body, {isHTML: true}, function(err, result) {
				      	if (err) {
				        	console.log('Error when detecting the language')
				        	return message.channel.send('Error when detecting the language')

				      	} else {
				        	if (!('languages' in result)) {
				          		console.log('No languages, apparently')
				          		return message.channel.send('Can\'t determine the language of the post. Consider rebloguing it manually')
				        	}
				        	let english = result['languages'].filter(lang => lang.name === 'ENGLISH')
				        	if (english.length === 0 || english[0].percent < 50) {
				          		console.log('I\'m not sure enough whether this post is in English')
				          		return
				        	}

				        	Resteem.resteem(voters[0].wif, voters[0].username, author, permlink)
			    			.then((val) => {
			    				console.log('resteemed')
			    				return message.channel.send('Resteemed')

			    			})
			    			.catch((err) => {
			    				console.log('Error when trying to resteem: ' + err)
			    				return message.channel.send('Error when trying to resteem')
			    			})
				      	}
			    	});
			  	}
			})
		})
	}
}