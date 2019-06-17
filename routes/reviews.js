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
    
// // Reviews Index
// router.get("/", function (req, res) {
//     Course.findById(req.params.id).populate({
//         path: "reviews",
//         options: {sort: {createdAt: -1}}
//     }).exec(function (err, course) {
//         if (err || !course) {
//             req.flash("error", err.message);
//             return res.redirect("back");
//         }
//         res.render("reviews/index", {course: course});
//     });
// });

// router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
//     Course.findById(req.params.id, function (err, course) {
//         if (err) {
//             req.flash("error", err.message);
//             return res.redirect("back");
//         }
//         res.render("reviews/new", {course: course});

//     });
// });

router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
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
            review.author.id = req.user._id;
            review.author.avatar = req.user.avatar;
            review.author.username = req.user.username;
            review.course = course;
            review.save();
            course.reviews.push(review);
            course.rating = calculateAverage(course.reviews);
            course.save();
            req.flash("success", "Twoja opinia została dodana.");
            res.redirect('/c/' + course._id);
        });
    });
});

// router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
//     Review.findById(req.params.review_id, function (err, foundReview) {
//         if (err) {
//             req.flash("error", err.message);
//             return res.redirect("back");
//         }
//         res.render("reviews/edit", {course: req.params.id, review: foundReview});
//     });
// });

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
            course.rating = calculateAverage(course.reviews);
            course.save();
            req.flash("success", "Edytowałeś swoją opinię.");
            res.redirect('/c/' + course._id);
        });
    });
});

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
            course.rating = calculateAverage(course.reviews);
            course.save();
            req.flash("success", "Usunąłeś swoją opinię.");
            res.redirect("/c/" + req.params.id);
        });
    });
});

module.exports = router;