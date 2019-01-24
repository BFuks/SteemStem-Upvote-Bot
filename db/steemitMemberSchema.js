var mongoose = require('mongoose')

// Define schema
var Schema = mongoose.Schema

var SteemitMemberSchema = new Schema({
    username: String,
    list: String
})

exports.SteemitMemberSchema = SteemitMemberSchema