var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
//mongoose.set('debug', true);
var Schema = mongoose.Schema;

var User = require('./user.js')
var folders = require('./folders.js')

var tasksSchema = new Schema({
	user: [
      {type: Schema.Types.ObjectId, ref: 'User'}
    ],
    //taskdata: Object,
    id: {type: String},
    accountId: {type: String},
    title: {type: String},
    description: {type: String},
    briefDescription: {type: String},
    parentIds: Object,
    parentFolderIds: {type: String},
    project: {type: Schema.Types.ObjectId, ref: 'folders'},
    superParentIds: Object,
    sharedIds: Object,
    responsibleIds: Object,
    status: {type: String},
    importance: {type: String},
    createdDate: {type: String},
    updatedDate: {type: String},
    dates: Object,
    scope: {type: String},
    authorIds: Object,
    customStatusId: {type: String},
    hasAttachments: {type: String},
    attachmentCount: {type: String},
    attachents: {type: String},
    permalink: {type: String},
    priority: {type: String},
    superTaskIds: Object,
    subTaskIds: Object,
    dependencyIds: {type: String},
    metadata: Object,
    customFields: Object,
    roles: Object
})
var tasks = module.exports = mongoose.model('tasks', tasksSchema);

module.exports.getalltasks = function(callback){
	var query = {};
	tasks.find(query, callback);
}

module.exports.getTasksByProject = function($projectId, callback){
    var query = {project: $projectId};
    tasks.find(query, callback);
}

module.exports.gettaskbyId = function($taskID, callback){
	var query = {_id: $taskID};
	tasks.findOne(query, callback);
}

module.exports.gettaskbyTitle = function($taskTitle, callback){
    var query = {title: $taskTitle};
    tasks.findOne(query, callback);
}

module.exports.gettaskbyParentId = function($taskID, callback){
    var query = {parentFolderIds: $taskID};
    tasks.find(query, callback);
}

module.exports.deletetask = function($taskID, callback){
    var query = {_id: $taskID};
    tasks.remove(query, callback);
}

// module.exports.getfolderbyId = function(folderid, callback){
// 	var query = {folderid: folderid};
// 	folder.find(query, callback);
// }