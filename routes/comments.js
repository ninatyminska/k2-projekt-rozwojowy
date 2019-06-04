var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Course      = require("../models/course"),
    Comment     = require("../models/comment"),
    middleware  = require("../middleware");

router.get("/new", middleware.isLoggedIn, function(req, res) {
    Course.findById(req.params.id, function(err, course){
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {course: course});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res) {
    Course.findById(req.params.id, function(err, course) {
        if(err) {
            req.flash("error", "Wystąpił błąd.");
            res.redirect("/courses");
        } else {
            Comment.create(req.body.comment, function(err, comment) {
                if(err) {
                    req.flash("error", "Wystąpił błąd.");
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    course.comments.push(comment);
                    course.save();
                    req.flash("success", "Komentarz dodany.");
                    res.redirect('/courses/' + course._id);
                }
            });
        }
    });
});

router.get("/:comment_id/edit", middleware.checkCommentOwner, function(req, res) {
    Course.findById(req.params.id, function(err, foundCourse) {
        if(err || !foundCourse) {
            req.flash("error", "Kurs nie został znaleziony.");
            res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err || !foundComment){
                req.flash("error", "Komentarz nie został znaleziony.");
                res.redirect("back");
            } else {
                res.render("comments/edit", {course_id: req.params.id, comment: foundComment});
            }
        });
    });    
});

router.put("/:comment_id", middleware.checkCommentOwner, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if(err) {
            res.redirect("back");
        } else {
            res.redirect("/courses/" + req.params.id);
        }
    });
});

router.delete("/:comment_id", middleware.checkCommentOwner, function(req, res) {
    Comment.findByIdAndDelete(req.params.comment_id, function(err) {
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Komentarz usunięty.");
            res.redirect("/courses/" + req.params.id);
        }
    });    
});

module.exports = router;