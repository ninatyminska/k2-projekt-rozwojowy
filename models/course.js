var mongoose = require("mongoose");

var courseSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    category: String,
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    date: Date,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
      {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
      }
   ],
   reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model("Course", courseSchema);