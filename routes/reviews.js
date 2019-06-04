var express    = require("express"),
    router     = express.Router({mergeParams: true}),
    Course     = require("../models/course"),
    Review     = require("../models/review"),
    middleware = require("../middleware");
    
function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}
    
// Reviews Index
router.get("/", function (req, res) {
    Course.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
    }).exec(function (err, course) {
        if (err || !course) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {course: course});
    });
});

// Reviews New
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    // middleware.checkReviewExistence checks if a user already reviewed the campground, only one review per user is allowed
    Course.findById(req.params.id, function (err, course) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {course: course});

    });
});

// Reviews Create
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    //lookup campground using ID
    Course.findById(req.params.id).populate("reviews").exec(function (err, course) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Review.create(req.body.review, function (err, review) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //add author username/id and associated campground to the review
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.course = course;
            //save review
            review.save();
            course.reviews.push(review);
            // calculate the new average review for the campground
            course.rating = calculateAverage(course.reviews);
            //save campground
            course.save();
            req.flash("success", "Twoja opinia została dodana.");
            res.redirect('/courses/' + course._id);
        });
    });
});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {course: req.params.id, review: foundReview});
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Course.findById(req.params.id).populate("reviews").exec(function (err, course) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            course.rating = calculateAverage(course.reviews);
            //save changes
            course.save();
            req.flash("success", "Edytowałeś swoją opinię.");
            res.redirect('/courses/' + course._id);
        });
    });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Course.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, course) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            course.rating = calculateAverage(course.reviews);
            //save changes
            course.save();
            req.flash("success", "Usunąłeś swoją opinię.");
            res.redirect("/courses/" + req.params.id);
        });
    });
});

module.exports = router;