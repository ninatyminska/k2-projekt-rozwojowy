var express        = require('express'),
    router         = express.Router(),
    passport       = require('passport'),
    User           = require('../models/user'),
    Course         = require('../models/course'),
    { isLoggedIn } = require('../middleware'),
    Notification   = require('../models/notification');
    
router.get('/', async (req, res) => {
    try {
        let allCourses = await Course.find({}).sort({date: 1}).exec();
        res.render('courses/courses', {courses : allCourses});
    } catch(err) {
        req.flash('error', 'Wystąpił błąd.');
        return res.redirect('back');
    }
}); 

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            avatar: req.body.avatar,
            about: req.body.about
        });
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            req.flash('error', 'Wystąpił błąd.');
            return res.redirect('register');
        }
        passport.authenticate('local')(req, res, () => {
            req.flash('success', 'Cześć ' + user.username + '! Rejestracja przebiegła pomyślnie.');
            res.redirect('/');
        });
    });
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local',
        {
            successReturnToOrRedirect: '/',
            failureRedirect: '/login',
            failureFlash: 'Nieprawidłowa nazwa użytkownika lub hasło.',
            successFlash: 'Zalogowano.'
        }), (req, res) => {
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Wylogowano.');
    res.redirect('back');
});

router.get('/users/:id', async (req, res) => {
    try {
        let user = await User.findById(req.params.id).populate('followers').exec();
        let courses = await Course.find().where('author.id').equals(user._id).exec();
        res.render('users/show', { user, courses });
    } catch(err) {
        req.flash('error', 'Wystąpił błąd.');
        return res.redirect('back');
    }
});

router.get('/follow/:id', isLoggedIn, async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        user.followers.push(req.user._id);
        user.save();
        req.flash('success', 'Użytkownik' + ' ' + user.username + ' dodany do obserwowanych.');
        res.redirect('/users/' + req.params.id);
    } catch(err) {
        req.flash('error', 'Wystąpił błąd.');
        res.redirect('back');
    }
});

router.get('/notifications', isLoggedIn, async (req, res) => {
    try {
        let user = await User.findById(req.user._id).populate({
            path: 'notifications',
            options: {sort: { '_id': -1 } }
        }).exec();
        let allNotifications = user.notifications;
        res.render('notifications/index', { allNotifications });
    } catch(err) {
        req.flash('error', 'Wystąpił błąd.');
        res.redirect('back');
    }
});

router.get('/notifications/:id', isLoggedIn, async (req, res) => {
    try {
        let notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notification.save();
        res.redirect(`/c/${notification.courseId}`);
    } catch(err) {
        req.flash('error', 'Wystąpił błąd.');
        res.redirect('back');
    }
});

module.exports = router;