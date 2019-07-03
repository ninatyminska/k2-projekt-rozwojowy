var express                   = require('express'),
    router                    = express.Router({mergeParams: true}),
    {check, validationResult} = require('express-validator'),
    Course                    = require('../models/course'),
    Comment                   = require('../models/comment'),
    User                      = require('../models/user'),
    Notification              = require('../models/notification'),
    middleware                = require('../middleware'),
    Review                    = require('../models/review');
    
router.get('/', async (req, res) => {
    try {
        let allCourses = await Course.find({}).sort({date: 1}).exec();
        res.render('courses/courses', {courses : allCourses});
    } catch(err) {
        req.flash('error', 'Wystąpił błąd.');
        return res.redirect('back');
    }
});    

router.post('/new', middleware.isLoggedIn, [
    check('name', 'Tytuł jest za krótki.').isLength({ min: 3 }),
    check('image', 'Podaj URL obrazka.').isURL(),
    check('description', 'Opis jest za krótki.').isLength({ min: 20 }),
    check('website', 'Podaj prawidłowy adres URL.').isURL(),
    check('category', 'Wybierz kategorię.').isLength({ min: 1 }),
    check('tag', 'Dodaj min. 1 tag.').isLength({ min: 1 }),
    check('date', 'Wybierz datę wydarzenia.').isLength({ min: 1 })
], async (req, res) => {
        var name   = req.body.name,
            image  = req.body.image,
            desc   = req.sanitize(req.body.description),
            web    = req.body.website,
            cat    = req.body.category,
            tag    = req.body.tag.replace(/\s/g,'').split(","),
            date   = req.body.date,
            author = {
            id: req.user._id,
            username: req.user.username,
            avatar: req.user.avatar
        };
        var newCourse = {name: name, image: image, description: desc, website: web, author: author, category: cat, tag: tag, date: date};
        var formErrors = validationResult(req);
        if (!formErrors.isEmpty()) {
            let arrayFormErrors = await formErrors.mapped();
            let errorsMsg = await arrayFormErrors;
            req.flash('error', 'Wystąpiły błędy w formularzu.');
            res.render('courses/new', {errors: errorsMsg, newCourse: newCourse, error: req.flash('error')});         
        } else {
            try {
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
        escription: undefined,
        website: undefined,
        image: undefined,
        category: undefined,
        date: undefined
    };
    res.render('courses/new', {errors: errors});
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
                    var errorMsgCom = undefined;
                    var errorsMsg = {
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

router.get('/c/:id/edit', middleware.checkCourseOwner, async (req, res) => {
    try {    
        let foundCourse = await Course.findById(req.params.id).exec();
        res.render('courses/edit', {course : foundCourse});
        if (!foundCourse) {
            throw req.flash('error', 'Kurs nie został znaleziony.');
            res.redirect('back');
        }
    } catch(err){
            req.flash('error', 'Wystąpił błąd.');
            res.redirect('back');
    }
});    

router.put('/c/:id', middleware.checkCourseOwner, [
    check('course[name]', 'Tytuł jest za krótki.').isLength({ min: 3 }),
    check('course[image]', 'Podaj URL obrazka.').isURL(),
    check('course[description]', 'Opis jest za krótki.').isLength({ min: 20 }),
    check('course[website]', 'Podaj prawidłowy adres URL.').isURL(),
], async (req, res) => {
    var formErrors = validationResult(req);
        if (!formErrors.isEmpty()) {
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
                                var arrayFormErrors = formErrors.mapped();
                                errorsMsg = arrayFormErrors;
                                req.flash('error', 'Formularz edycji zawiera błędy.');
                                return res.render('courses/show', {course: foundCourse, courses: allCourses, errorsMsg: errorsMsg, error: req.flash('error')});
                            };       
                        }); 
                    }
                });            
        } else {    

    try {
        let updatedCourse = Course.findByIdAndUpdate(req.params.id, req.body.course).exec();
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