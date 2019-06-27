var express    = require('express'),
    router     = express.Router({mergeParams: true}),
    Course     = require('../models/course'),
    Review     = require('../models/review'),
    middleware = require('../middleware');
    
function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(element => {
        sum += element.rating;
    });
    return sum / reviews.length;
}

router.post('/', middleware.isLoggedIn, middleware.checkReviewExistence, (req, res) => {
    Course.findById(req.params.id).populate('reviews').exec((err, course) => {
        if (err) {
            req.flash('error', 'Wystąpił błąd.');
            return res.redirect('back');
        }
        Review.create(req.body.review, (err, review) => {
            if (err) {
                req.flash('error', 'Wystąpił błąd.');
                return res.redirect('back');
            }
            review.author.id = req.user._id;
            review.author.avatar = req.user.avatar;
            review.author.username = req.user.username;
            review.course = course;
            review.save();
            course.reviews.push(review);
            course.rating = calculateAverage(course.reviews);
            course.save();
            req.flash('success', 'Opinia została dodana.');
            res.redirect('/c/' + course._id);
        });
    });
});

router.put('/:review_id', middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, (err, updatedReview) => {
        if (err) {
            req.flash('error', 'Wystąpił błąd.');
            return res.redirect('back');
        }
        Course.findById(req.params.id).populate('reviews').exec((err, course) => {
            if (err) {
                req.flash('error', 'Wystąpił błąd.');
                return res.redirect('back');
            }
            course.rating = calculateAverage(course.reviews);
            course.save();
            req.flash('success', 'Opinia zaktualizowana.');
            res.redirect('/c/' + course._id);
        });
    });
});

router.delete('/:review_id', middleware.checkReviewOwnership, (req, res) => {
    Review.findByIdAndRemove(req.params.review_id, err => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        Course.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate('reviews').exec((err, course) => {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            course.rating = calculateAverage(course.reviews);
            course.save();
            req.flash('success', 'Opinia usunięta.');
            res.redirect('/c/' + req.params.id);
        });
    });
});

module.exports = router;