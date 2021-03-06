var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	firstname: { type: String},
	lastname: { type: String},
	title: { type: String},
	type: { type: String},
	phone:{type:String},
	roles: { type: String},
	types: { type: String},
	avatarUrl: { type: String},
	deleted: {type: String},
	resetPasswordToken: String,
  	resetPasswordExpires: Date
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.getAllUsers = function(callback) {
	var query = {};
	User.find(query, callback);
}

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}


module.exports.updateUser = function(User, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(User.password, salt, function(err, hash) {
	        User.password = hash;
	        User.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}
module.exports.getcontacts = function(callback){
	var query = {};
	User.find(query, callback);
}
module.exports.getAllUser = function(callback){
	var query = {};
	User.find(query, callback);
}

module.exports.getUserID = function(id, callback){
	var query = {_id: id};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}


module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}