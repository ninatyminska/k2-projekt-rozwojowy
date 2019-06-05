var express        = require("express"),
    router         = express.Router(),
    passport       = require("passport"),
    User           = require("../models/user"),
    Course         = require("../models/course"),
    { isLoggedIn } = require("../middleware"),
    Notification   = require("../models/notification");
    
router.get("/", function(req, res){
    res.render("index");
});

router.get("/register", function(req, res) {
    res.render("register");
});

router.post("/register", function(req, res) {
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        });
    if(req.body.adminCode === 'secretcode') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            req.flash("error", err.message);
            return res.redirect("register");
        }
        passport.authenticate("local")(req, res, function() {
            req.flash("success", "Cześć " + user.username + "! Rejestracja przebiegła pomyślnie.");
            res.redirect("/");
        });
    });
});

router.get("/login", function(req, res) {
    res.render("login");
});

router.post("/login", passport.authenticate("local",
        {
            successRedirect: "/",
            failureRedirect: "/login",
            failureFlash: 'Nieprawidłowa nazwa użytkownika lub hasło.',
            successFlash: 'Zalogowano.'
        }), function(req, res) {
});

router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Wylogowałeś się.");
    res.redirect("/");
});

router.get("/users/:id", async function(req, res) {
    try {
        let user = await User.findById(req.params.id).populate('followers').exec();
        let courses = await Course.find().where('author.id').equals(user._id).exec();
        res.render('users/show', { user, courses });
    } catch(err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }
});

router.get("/follow/:id", isLoggedIn, async function(req, res) {
    try {
        let user = await User.findById(req.params.id);
        user.followers.push(req.user._id);
        user.save();
        req.flash("success", "Obserwujesz teraz użytkownika" + user.username + ".");
        res.redirect("/users/" + req.params.id);
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("back");
    }
});

router.get('/notifications', isLoggedIn, async function(req, res) {
    try {
        let user = await User.findById(req.user._id).populate({
            path: 'notifications',
            options: {sort: { "_id": -1 } }
        }).exec();
        let allNotifications = user.notifications;
        res.render('notifications/index', { allNotifications });
    } catch(err) {
        req.flash('error', err.message);
        res.redirect('back');
    }
});

router.get("/notifications/:id", isLoggedIn, async function(req, res) {
    try {
        let notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect(`/courses/${notification.courseId}`);
    } catch(err) {
        req.flash("error", err.message);
        res.redirect("back");
    }
});

module.exports = router;