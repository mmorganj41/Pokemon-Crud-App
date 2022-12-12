const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/user');

// configuring Passport!
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
		let user = await User.findOne({googleId: profile.id});

		if (user) return cb(null, user);

		user = await User.create({
			name: profile.displayName,
			googleId: profile.id,
			email: profile.emails[0].value,
			avatar: profile.photos[0].value,
			money: 0,
		});

		return cb(null, user);

	} catch(err) {
		return cb(err);
	} 
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {

  try {
	user = await User.findById(id);
	done(null, user);
  } catch(err) {
	return cb(err);
  }
});



