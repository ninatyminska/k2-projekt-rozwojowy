var express                   = require('express'),
    router                    = express.Router({mergeParams: true}),
    {check, validationResult} = require('express-validator'),
    Course                    = require('../models/course'),
    Comment                   = require('../models/comment'),
    User                      = require('../models/user'),
    Notification              = require('../models/notification'),
    path                      = require('path'),
    middleware                = require('../middleware'),
    upload                    = require('../middleware/upload'),
    Resize                    = require('../middleware/Resize'),
    Review                    = require('../models/review');

router.post('/new', middleware.isLoggedIn, upload.single('image'), [
    check('name', 'Tytuł jest za krótki.').isLength({ min: 3 }),
    check('description', 'Opis jest za krótki.').isLength({ min: 20 }),
    check('website', 'Podaj prawidłowy adres URL.').isURL(),
    check('category', 'Wybierz kategorię.').isLength({ min: 1 }),
    check('tag', 'Dodaj min. 1 tag.').isLength({ min: 1 }),
    check('date', 'Wybierz datę wydarzenia')
        .if((value, { req }) => ['Konferencja', 'Meetup', 'Warsztat'].includes(req.body.category))
        .isLength({ min: 1 })
], async (req, res, next) => {
    let filename = "",
        name   = req.body.name,
        image  = "images/" + filename,
        desc   = req.sanitize(req.body.description),
        web    = req.body.website,
        cat    = req.body.category,
        tag    = req.body.tag.split(","),
        date   = req.body.date,
        expireAt = req.body.date,
        author = {
            id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar
        };
    let formErrors = validationResult(req);
    if (!req.file && !formErrors.isEmpty()) {
        let arrayFormErrors = await formErrors.mapped();
        let errorsMsg = await arrayFormErrors;
        let fileErr = "Dodaj plik.";
        let newCourse = {name: name, image: image, description: desc, website: web, author: author, category: cat, tag: tag, date: date, expireAt: expireAt};
        req.flash('error', 'Wystąpiły błędy w formularzu.');
        res.render('courses/new', {errors: errorsMsg, newCourse: newCourse, error: req.flash('error'), fileErr: fileErr});         
    } else if (!req.file) {
        let fileErr = "Dodaj plik.";
        let errorsMsg = {
            name: undefined,
            escription: undefined,
            website: undefined,
            category: undefined,
            date: undefined
        };
        let newCourse = {name: name, image: image, description: desc, website: web, author: author, category: cat, tag: tag, date: date, expireAt: expireAt};
        req.flash('error', 'Wystąpiły błędy w formularzu.');
        res.render('courses/new', {errors: errorsMsg, newCourse: newCourse, error: req.flash('error'), fileErr: fileErr});
    } else if (req.file && !formErrors.isEmpty()) {
        let newCourse = {name: name, image: image, description: desc, website: web, author: author, category: cat, tag: tag, date: date, expireAt: expireAt};
        let arrayFormErrors = await formErrors.mapped();
        let errorsMsg = await arrayFormErrors;
        let fileErr = "";
        req.flash('error', 'Wystąpiły błędy w formularzu.');
        res.render('courses/new', {errors: errorsMsg, newCourse: newCourse, error: req.flash('error'), fileErr: fileErr});         
    } else {
        try {
            let imagePath = path.join(__dirname, '../public/images'),
                fileUpload = new Resize(imagePath);
                filename = await fileUpload.save(req.file.buffer);
                image  = "images/" + filename;
            let newCourse = {name: name, image: image, description: desc, website: web, author: author, category: cat, tag: tag, date: date, expireAt: expireAt};
            let course = await Course.create(newCourse);
            let user = await User.findById(req.user._id).populate('followers').exec();
            let newNotification = {
                username: req.user.username,
                userId: req.user._id,
                avatar: req.user.avatar,
                courseId: course.id,
                courseName: course.name
            };
            for(const follower of user.followers) {
                let notification = await Notification.create(newNotification);
                follower.notifications.push(notification);
                follower.save();
            }
            req.flash('success', 'Wpis dodany.');
            res.redirect(`/c/${course.id}`);
        } catch(err) {
            req.flash('error', 'Wystąpił błąd.');
        }
    }  
});

router.get('/new', middleware.isLoggedIn, (req, res) => {
    var errors = {
        name: undefined,
        description: undefined,
        website: undefined,
        category: undefined,
        date: undefined
    };
    var fileErr = "";
    res.render('courses/new', {errors: errors, fileErr: fileErr});
});

router.get('/c/:id', (req, res) => {
   Course.findById(req.params.id).populate('comments').populate({
        path: 'reviews',
        options: {sort: {createdAt: -1}}
    }).exec((err, foundCourse) => {
        if (err) {
            req.flash('error', 'Wystąpił błąd.');
            console.log(err);
        } else {
            Course.find({}, (err, allCourses) => {
                if(err) {
                    req.flash('error', 'Wystąpił błąd.');
                    console.log(err);
                } else {
                    let errorMsgCom = undefined;
                    let errorsMsg = {
                        'course.name': undefined,
                        'course.description': undefined,
                        'course.website': undefined,
                        'course.image': undefined,
                    };
                    res.render('courses/show', {course: foundCourse, courses: allCourses, errorMsgCom: errorMsgCom, errorsMsg: errorsMsg});
                }
            });
        }
    });
});   

router.put('/c/:id', middleware.checkCourseOwner, upload.single('image'), [
    check('course[name]', 'Tytuł jest za krótki.').isLength({ min: 3 }),
    check('course[description]', 'Opis jest za krótki.').isLength({ min: 20 }),
    check('course[tag]', 'Dodaj min. 1 tag.').isLength({ min: 1 }),
    check('course[website]', 'Podaj prawidłowy adres URL.').isURL(),
    check('course[date]', 'Wybierz datę wydarzenia')
        .if((value, { req }) => ['Konferencja', 'Meetup', 'Warsztat'].includes(req.body.course[category]))
        .isLength({ min: 1 })
], async (req, res) => {
    let filename = "",
        formErrors = validationResult(req);
        if (!req.file && !formErrors.isEmpty()) {
            Course.findById(req.params.id).populate('comments').populate({
                    path: 'reviews',
                    options: {sort: {createdAt: -1}}
                }).exec((error, foundCourse) => {
                    if (error) {
                        req.flash('error', 'Wystąpił błąd.');
                        console.log(error);
                    } else {
                        Course.find({}, (error, allCourses) => {
                            if(error) {
                                req.flash('error', 'Wystąpił błąd.');
                                console.log(error);
                            } else {
                                let arrayFormErrors = formErrors.mapped(),
                                    errorsMsg = arrayFormErrors,
                                    fileErr = "Dodaj plik.";
                                req.flash('error', 'Formularz edycji zawiera błędy.');
                                return res.render('courses/show', {course: foundCourse, courses: allCourses, errorsMsg: errorsMsg, error: req.flash('error'), fileErr: fileErr});
                            }
                        }); 
                    }
                });            
        } else if (req.file && !formErrors.isEmpty()) {
            Course.findById(req.params.id).populate('comments').populate({
                    path: 'reviews',
                    options: {sort: {createdAt: -1}}
                }).exec((error, foundCourse) => {
                    if (error) {
                        req.flash('error', 'Wystąpił błąd.');
                        console.log(error);
                    } else {
                        Course.find({}, (error, allCourses) => {
                            if(error) {
                                req.flash('error', 'Wystąpił błąd.');
                                console.log(error);
                            } else {
                                let arrayFormErrors = formErrors.mapped(),
                                    errorsMsg = arrayFormErrors,
                                    fileErr = "";
                                req.flash('error', 'Formularz edycji zawiera błędy.');
                                return res.render('courses/show', {course: foundCourse, courses: allCourses, errorsMsg: errorsMsg, error: req.flash('error'), fileErr: fileErr});
                            }
                        }); 
                    }
                });            
        } else if (!req.file && formErrors.isEmpty()) {
            Course.findByIdAndUpdate(req.params.id, { $set: { 'name': req.body.course.name, 'description': req.body.course.description, 'tag': req.body.course.tag.split(","), 'website': req.body.course.website, 'category': req.body.course.category, 'date': req.body.course.date, 'expireAt': req.body.course.date } }, {new: true}).exec();
            req.flash('success', 'Kurs zaktualizowany.');
            res.redirect('/c/' + req.params.id);
        } else {
        try {
            let imagePath = path.join(__dirname, '../public/images'),
                fileUpload = new Resize(imagePath);
            filename = await fileUpload.save(req.file.buffer);
            Course.findByIdAndUpdate(req.params.id, { $set: { 'name': req.body.course.name, 'description': req.body.course.description, 'image': "http://k2-projekt-rozwojowy.neira.pl/images/" + filename, 'tag': req.body.course.tag.split(","), 'website': req.body.course.website, 'category': req.body.course.category, 'date': req.body.course.date, 'expireAt': req.body.course.date } }, {new: true}).exec();
            req.flash('success', 'Kurs zaktualizowany.');
            res.redirect('/c/' + req.params.id);
        } catch(err) {
            console.log(err);
        }
    }    
});

router.delete('/c/:id', middleware.checkCourseOwner, (req, res) => {
    Course.findById(req.params.id, (err, course) => {
        if (err) {
            req.flash('error', 'Wystąpił błąd.');
            res.redirect('/');
        } else {
            Comment.deleteOne({'_id': {$in: course.comments}}, err => {
                if (err) {
                    req.flash('error', 'Wystąpił błąd.');
                    return res.redirect('/');
                }
                Review.deleteOne({'_id': {$in: course.reviews}}, err => {
                    if (err) {
                        req.flash('error', 'Wystąpił błąd.');
                        return res.redirect('/');
                    }
                    course.remove();
                    req.flash('success', 'Kurs został usunięty.');
                    res.redirect('/');
                });
            });
        }
    });
});     

module.exports = router;