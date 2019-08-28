const mongoose = require("mongoose");

let reviewSchema = new mongoose.Schema({
    rating: {
        required: "Wybierz ocenę od 1 do 5.",
        type: Number,
        min: 1,
        max: 5
    },
    text: {
        type: String
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        avatar: String
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Review", reviewSchema);