//dependencies
const express = require('express');
const path = require('path')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash')
const ExpressError = require('./utilities/ExpressError')
const methodOverride = require('method-override');
const router = express.Router();
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user')


mongoose.set('strictQuery', false);

// define what to require and what directory
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')

// line of code for mongoose or connection to the database
main().catch(err => console.log(err));

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (e) {
        console.log('Error found: ', e)
    }
}

// logic to check if there is an error 
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database Connected")
});

// use the express app for http verbs
const app = express();

// Middlewares
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// this is for configuring the session
const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        htttpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

// config for both the session and flash or pop ups
app.use(session(sessionConfig));
app.use(flash());

// config for passport 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); // it says "passport use the new local strat having an authentication method of athenticate in the User model"

passport.serializeUser(User.serializeUser()); // how to store user in a session
passport.deserializeUser(User.deserializeUser()); // how to remove user in a session

app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/fakeUser', async(req, res) => {
    const user = await new User({email: 'zy@gmail.com', username: 'zy'});
    const registerUser = await User.register(user, 'chicken');
    res.send(registerUser)
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes)

// show the home page: index
router.get('/', (req, res) => {
    res.render('home');
});


// 
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err,req,res,next) => {
    const {statusCode = 500, message = 'Something Went Wrong'} = err;
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () => {
    console.log('Serving on port 3000')
});