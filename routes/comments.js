var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Course      = require("../models/course"),
    Comment     = require("../models/comment"),
    middleware  = require("../middleware");

router.post("/", middleware.isLoggedIn, function(req, res) {
    Course.findById(req.params.id, function(err, course) {
        if(err) {
            req.flash("error", "Wystąpił błąd.");
            res.redirect("/");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if(err) {
                    req.flash("error", "Wystąpił błąd.");
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.author.avatar = req.user.avatar;
                    comment.save();
                    course.comments.push(comment);
                    course.save();
                    req.flash("success", "Komentarz dodany.");
                    res.redirect('/c/' + course._id);
                }
            });
        }
    });
});

router.put("/:comment_id", middleware.checkCommentOwner, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, {new: true}, function(err, updatedComment) {
        if(err) {
            req.flash("error", "Wystąpił błąd.");
            res.redirect("back");
        } 
        Course.findById(req.params.id).populate("comments").exec(function (err, course) {
            if (err) {
                req.flash("error", "Wystąpił błąd.");
                return res.redirect("back");
            }
            req.flash("success", "Komentarz zaktualizowany.");
            res.redirect("/c/" + req.params.id);
        });
    });
});

router.delete("/:comment_id", middleware.checkCommentOwner, function(req, res) {
    Comment.findByIdAndDelete(req.params.comment_id, function(err) {
        if(err) {
            req.flash("error", "Wystąpił błąd.");
            res.redirect("back");
        } 
        Course.findByIdAndUpdate(req.params.id, {$pull: {comments: req.params.comment_id}}, {new: true}).exec(function (err) {
            if (err) {
                req.flash("error", "Wystąpił błąd.");
                return res.redirect("back");
            }
            req.flash("success", "Komentarz usunięty.");
            res.redirect("/c/" + req.params.id);
        });
    });
});

module.exports = router;