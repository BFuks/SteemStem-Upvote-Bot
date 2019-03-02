/**
 * Run this script to feed the mongoDB with the JSON data of the blacklist
 * on the Mobbs's Github repository:
 * node blacklist_to_mongo.js
*/

var https = require('https')
var mongoose = require('mongoose')


const GITHUB_BLACKLIST_URL = 'https://raw.githubusercontent.com/mobbs2/steemstem/master/steemstem.json'
const MONGODB_URL = '' //<= PUT your mongodb url here:


https.get(GITHUB_BLACKLIST_URL, function(res) {
    let data = ''

    res.on('data', function(chunk) {
        data += chunk
    })

    res.on('end', function() {
        data = JSON.parse(data)
        InsertMembers(data['records'])
    })

}).on('error', function(err) {
    console.log('Error: ' + err.message)
})


InsertMembers = function(jsonMembers) {
    var members = []
    var Schema = mongoose.Schema
    var SteemitMemberSchema = new Schema({
        username: String,
        list: String    
    })

    mongoose.connect(MONGODB_URL, {useNewUrlParser: true}, function(err, db) {
        if (err) {
            console.log('Error when connecting to mongo: ' + err.message)
        }
        else {
            var SteemitMemberModel = mongoose.model('steemit_members', SteemitMemberSchema)

            jsonMembers.forEach(function(record){

                if (record['BLACKLIST'] !== '') {
                    var member = new SteemitMemberModel()
                    member.username = record['BLACKLIST']
                    member.list = 'blacklist'
                    members.push(member)
                }

                if (record['WHITELIST'] !== '') {
                    var member = new SteemitMemberModel()
                    member.username = record['WHITELIST']
                    member.list = 'whitelist'
                    members.push(member)
                }

                if (record['GREYLIST'] !== '') {
                    var member = new SteemitMemberModel()
                    member.username = record['GREYLIST']
                    member.list = 'greylist'
                    members.push(member)
                }
            })
            
            SteemitMemberModel.collection.insertMany(members, function(err, res) {
                if (err) {
                    console.log('error when inserting members ' + err.message)
                }
                else {
                    console.info('%d members inserted into steemit_members collection', res.insertedCount)
                    mongoose.connection.close()
                }
            })
        }
    })
}
