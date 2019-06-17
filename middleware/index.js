var Course  = require("../models/course"),
    Comment = require("../models/comment"),
    Review  = require("../models/review");

var middlewareObj = {};

middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Musisz się najpierw zalogować.");
    res.redirect("/login");
};

middlewareObj.checkCourseOwner = function checkCourseOwner(req, res, next) {
    if(req.isAuthenticated()) {
        Course.findById(req.params.id, function(err, foundCourse) {
            if(err || !foundCourse) {
                req.flash("error", "Kurs nie został znaleziony.");
                res.redirect("back");
            } else {
                if(foundCourse.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "Brak uprawnień.");
                    res.redirect("back");
                }
                
            }
        });
    } else {
        req.flash("error", "Musisz się najpierw zalogować.");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwner = function checkCommentOwner(req, res, next) {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err || !foundComment) {
                req.flash("error", "Komentarz nie został znaleziony.");
                res.redirect("back");
            } else {
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "Brak uprawnień.");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Musisz się najpierw zalogować.");
        res.redirect("back");
    }
};

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                if(foundReview.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Course.findById(req.params.id).populate("reviews").exec(function (err, foundCourse) {
            if (err || !foundCourse) {
                req.flash("error", "Kurs nie został znaleziony.");
                res.redirect("back");
            } else {
                var foundUserReview = foundCourse.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "Twoja opinia została już dodana.");
                    return res.redirect("/" + foundCourse._id);
                }
                next();
            }
        });
    } else {
        req.flash("error", "Musisz się najpierw zalogować.");
        res.redirect("back");
    }
};

module.exports = middlewareObj;