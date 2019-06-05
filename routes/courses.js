var express      = require("express"),
    router       = express.Router({mergeParams: true}),
    Course       = require("../models/course"),
    Comment      = require("../models/comment"),
    User         = require("../models/user"),
    Notification = require("../models/notification"),
    middleware   = require("../middleware"),
    Review       = require("../models/review");
    
router.get("/", function(req, res) {
    Course.find({}, function(err, allCourses) {
        if(err) {
            console.log(err);
        } else {
            res.render("courses/courses", {courses : allCourses});
        }
    });
});

router.post("/", middleware.isLoggedIn, async function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCourse = {name: name, image: image, description: desc, author:author};

    try {
      let course = await Course.create(newCourse);
      let user = await User.findById(req.user._id).populate('followers').exec();
      let newNotification = {
        username: req.user.username,
        courseId: course.id
      };
      for(const follower of user.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
      }

      res.redirect(`/courses/${course.id}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
});

router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("courses/new");
});

router.get("/:id", function(req, res) {
   Course.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCourse) {
        if (err) {
            console.log(err);
        } else {
            res.render("courses/show", {course: foundCourse});
        }
    });
});

router.get("/:id/edit", middleware.checkCourseOwner, function(req, res) {
   Course.findById(req.params.id, function(err, foundCourse) {
       if(err || !foundCourse) {
           req.flash("error", "Kurs nie został znaleziony.");
           res.redirect("back");
        } else {
            res.render("courses/edit", {course : foundCourse});
        }
    });
});

router.put("/:id", middleware.checkCourseOwner, function(req, res) {
    Course.findByIdAndUpdate(req.params.id, req.body.course, function(err, updatedCourse) {
        if(err) {
            res.redirect("back");
        } else {
            res.redirect("/courses/" + req.params.id);
        }
    });
});

router.delete("/:id", middleware.checkCourseOwner, function (req, res) {
    Course.findById(req.params.id, function (err, course) {
        if (err) {
            res.redirect("/courses");
        } else {
            Comment.remove({"_id": {$in: course.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/courses");
                }
                Review.remove({"_id": {$in: course.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/courses");
                    }
                    course.remove();
                    req.flash("success", "Kurs został usunięty!");
                    res.redirect("/courses");
                });
            });
        }
    });
});

module.exports = router;