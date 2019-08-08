var mongoose = require('mongoose')

// Define schema
var Schema = mongoose.Schema

var TeamMemberSchema = new Schema({
    username: {type: String, unique: true, required: true},
    role: String
})

exports.TeamMemberSchema = TeamMemberSchema