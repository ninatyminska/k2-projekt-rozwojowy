var mongoose = require("mongoose");

var notificationSchema = new mongoose.Schema({
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
        index: { expires: '30000' },
    },
    isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notification", notificationSchema);