const mongoose = require('mongoose');

let notificationSchema = new mongoose.Schema({
	username: String,
	userId: String,
	avatar: String,
	courseId: String,
	courseName: String,
	createdAt: { 
		type: Date, 
		default: Date.now 
	},
	expireAt: {
		type: Date,
		default: Date.now,
		index: { expires: '2592000000' }
	},
	isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model('Notification', notificationSchema);