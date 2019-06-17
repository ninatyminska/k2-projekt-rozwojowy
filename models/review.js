var mongoose = require("mongoose");

var reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: "Wybierz ocenę od 1 do 5.",
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: "{VALUE} is not an integer value."
        }
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