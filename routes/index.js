const router = require('express').Router();
const passport = require('passport');
const isLoggedIn = require('../config/auth');
const usersController = require('../controllers/users');

router.put('/user/money', isLoggedIn, usersController.updateMoney);
router.put('/user/currentPokemon/:id', isLoggedIn, usersController.selectPokemon);

// The root route renders our only view
router.get('/', function(req, res) {
	res.render('index', {title: 'Pokemon!'})
});

router.get('/redirect', function(req, res) {
  if (req.user?.currentPokemon) {
	res.redirect(`/pokemon/${req.user.currentPokemon.toString()}`)
  } else {
	res.redirect('/pokemon');
  }
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
    failureRedirect : '/',
    successRedirect: '/redirect'
  }
));

// OAuth logout route
router.get('/logout', function(req, res){
  req.logout(function(){
    res.redirect('/') 
  })
});

module.exports = router;
