const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	avatar: String,
	firstName: String,
	lastName: String,
	about: String,
	isAdmin: { type: Boolean, default: false },
	notifications: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Notification'
		}
	],
	followers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		}
	]
});

const options = {
	errorMessages: {
		MissingUsernameError: 'Nazwa użytkownika jest wymagana.',
		MissingPasswordError: 'Hasło jest wymagane.',
		UserExistsError: 'Użytkownik już istnieje.'
	}
};

UserSchema.plugin(passportLocalMongoose, options);

module.exports = mongoose.model('User', UserSchema);