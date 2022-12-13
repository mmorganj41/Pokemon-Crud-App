// load the env consts
require('dotenv').config();

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
// session middleware
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const publicPath = path.join(__dirname, 'public');
const MongoStore = require('connect-mongo');

const indexRouter = require('./routes/index');
const pokemonRouter = require('./routes/pokemon');
const movesRouter = require('./routes/moves');
const battleRouter = require('./routes/battle');
const apiRouter = require('./routes/api');
const shopRouter = require('./routes/shop');


// create the Express app
const app = express();

// connect to the MongoDB with mongoose
require('./config/database');
// configure Passport
require('./config/passport');



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(publicPath));

app.use(methodOverride('_method'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// mount the session middleware



app.use(session({
	store: MongoStore.create({
	  mongoUrl: process.env.DATABASE_URL
	}),
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: true
  }));


app.use(passport.initialize());
app.use(passport.session());


// Add this middleware BELOW passport middleware
app.use(function (req, res, next) {
  res.locals.user = req.user; // assinging a property to res.locals, makes that said property (user) availiable in every
  res.locals.pathurl = req.originalUrl;
  // single ejs view
  next();
});

// mount all routes with appropriate base paths
app.use('/', indexRouter);
app.use('/pokemon', pokemonRouter);
app.use('/', movesRouter);
app.use('/', battleRouter);
app.use('/api', apiRouter);
app.use('/shop', shopRouter);


// invalid request, send 404 page
app.use(function(req, res) {
  res.status(404).send('Cant find that!');
});

module.exports = app;