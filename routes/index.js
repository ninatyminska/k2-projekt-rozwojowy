var express        = require('express'),
    router         = express.Router(),
    {check, validationResult} = require('express-validator'),
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
    var errors = {
        username: undefined,
        password: undefined,
        firstName: undefined,
        lastName: undefined,
        avatar: undefined,
        about: undefined
    };
    res.render('register', {errors: errors});
});

router.post('/register', [
    check('username', 'Nazwa użytkownika musi zawierać min. 3 znaki.').isLength({ min: 3 }),
    check('password').isLength({ min: 5 }).withMessage('Hasło musi zawierać min. 5 znaków.')
    .matches(/\d/).withMessage('Hasło musi zawierać cyfrę.'),
    check('firstName', 'Imię musi zawierać min. 3 znaki.').isLength({ min: 3 }),
    check('lastName', 'Nazwisko musi zawierać min. 3 znaki.').isLength({ min: 3 }),
    check('avatar', 'Podaj URL obrazka.').isURL(),
    check('about', 'Napisz kilka słów o sobie.').isLength({ min: 10 })
], async (req, res) => {
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            avatar: req.body.avatar,
            about: req.body.about
        });
    var formErrors = validationResult(req);
    if (!formErrors.isEmpty()) {
        let arrayFormErrors = await formErrors.mapped();
        let errorsMsg = await arrayFormErrors;
        req.flash('error', 'Wystąpiły błędy w formularzu.');
        res.render('register', {errors: errorsMsg, newUser: newUser, error: req.flash('error')});
    } else {
        try {    
            User.register(newUser, req.body.password, (err, user) => {
                passport.authenticate('local')(req, res, () => {
                    req.flash('success', 'Cześć ' + user.username + '! Rejestracja przebiegła pomyślnie.');
                    res.redirect('/');
                });
            });
        } catch(err) {
            req.flash('error', 'Wystąpił błąd.');
            return res.redirect('register');
        }       
    }    
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