/* eslint-disable */
const express     = require('express'),
	  router      = express.Router({ mergeParams: true }),
	  Course      = require('../models/course'),
	  Comment     = require('../models/comment'),
	  middleware  = require('../middleware');
/* eslint-enable */

router.post('/', middleware.isLoggedIn, (req, res) => {
	Course.findById(req.params.id, (err, course) => {
		if(err) {
			req.flash('error', 'Wystąpił błąd.');
			res.redirect('/');
		} else {
			Comment.create(req.body.comment, (err, comment) => {
				if(err) {
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
									errorMsgCom = err.errors.text.message;
									let errorsMsg = {
										'course.name': undefined,
										'course.description': undefined,
										'course.website': undefined,
										'course.image': undefined,
									};
									req.flash('error', 'Uzupełnij formularz komentarza.');
									return res.render('courses/show', { course: foundCourse, courses: allCourses, errorMsgCom: errorMsgCom, errorsMsg: errorsMsg, error: req.flash('error') });
								};       
							}); 
						}
					});   
				} else {
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.author.avatar = req.user.avatar;
					comment.save();
					course.comments.push(comment);
					if(req.body.participants !== undefined) {
						course.participants.push(req.body.participants);
					};
					course.save();
					req.flash('success', 'Komentarz dodany.');
					res.redirect('/c/' + course._id);
				}
			});
		}
	});
});

router.put('/:comment_id', middleware.checkCommentOwner, (req, res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, { runValidators: true, new: true }, (err, updatedComment) => {
		if(err) {
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
							errorMsgComEdit = err.errors.text.message;
							let errorsMsg = {
								'course.name': undefined,
								'course.description': undefined,
								'course.website': undefined,
								'course.image': undefined,
							};
							req.flash('error', 'Uzupełnij formularz komentarza.');
							return res.render('courses/show', { course: foundCourse, courses: allCourses, errorMsgComEdit: errorMsgComEdit, errorsMsg: errorsMsg, error: req.flash('error') });
						}       
					}); 
				}
			});   
		} else {
			Course.findById(req.params.id).populate('comments').exec((err, course) => {
				if (err) {
					req.flash('error', 'Wystąpił błąd.');
					return res.redirect('back');
				}
				errorMsgComEdit = undefined;
				req.flash('success', 'Komentarz zaktualizowany.');
				res.redirect('/c/' + req.params.id);
			});
		}
	});
});

router.delete('/:comment_id', middleware.checkCommentOwner, (req, res) => {
	Comment.findByIdAndDelete(req.params.comment_id, err => {
		if(err) {
			req.flash('error', 'Wystąpił błąd.');
			res.redirect('back');
		} 
		Course.findByIdAndUpdate(req.params.id, { $pull: { comments: req.params.comment_id } }, { new: true }).exec(err => {
			if (err) {
				req.flash('error', 'Wystąpił błąd.');
				return res.redirect('back');
			}
			req.flash('success', 'Komentarz usunięty.');
			res.redirect('/c/' + req.params.id);
		});
	});
});

module.exports = router;