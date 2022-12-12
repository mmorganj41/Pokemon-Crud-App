const router = require('express').Router();
const passport = require('passport');
const isLoggedIn = require('../config/auth');
const usersController = require('../controllers/users');

router.put('/user/:id', usersController.updateMoney);

// The root route renders our only view
router.get('/', function(req, res) {
  res.render('index', {title: 'Home'});
});

// Google OAuth login route
router.get('/auth/google', passport.authenticate(
  'google',
  { scope: ['profile', 'email'] }
));

// Google OAuth callback route
router.get('/oauth2callback', passport.authenticate(
  'google',
  {
    failureRedirect : '/pokemon',
    successRedirect: '/pokemon'
  }
));

// OAuth logout route
router.get('/logout', function(req, res){
  req.logout(function(){ //< - req.logout comes from passport, and what it does is destorys the cookie keeping track of the user!
    res.redirect('/pokemon') // <---- UPDATE THIS TO WHERE YOU WANT THE USER TO GO AFTER LOGOUT
  })
});

module.exports = router;
