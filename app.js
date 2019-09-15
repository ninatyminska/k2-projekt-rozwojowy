const express          = require("express"),
      favicon          = require('serve-favicon'),
      path             = require('path'),
      app              = express(),
      bodyParser       = require("body-parser"),
      mongoose         = require("mongoose"),
      passport         = require("passport"),
      expressSanitizer = require('express-sanitizer'),
      LocalStrategy    = require("passport-local"),
      methodOverride   = require("method-override"),
      flash            = require("connect-flash"),
      User             = require("./models/user"),
      Course           = require('./models/course'),
      rss              = require('rss');
    
const indexRoutes    = require("./routes/index"),
      courseRoutes   = require("./routes/courses"),
      commentRoutes  = require("./routes/comments"),
      reviewRoutes   = require("./routes/reviews");

const mdb = process.env.MDB_PSSW;
mongoose.connect("mongodb+srv://Nina:" + mdb + "@cluster0-yab5c.mongodb.net/k2-projekt-rozwojowy?retryWrites=true&w=majority", { useNewUrlParser: true, useCreateIndex: true });
mongoose.set('useFindAndModify', false);

app.use(favicon(path.join(__dirname,'public','favicons','favicon-32x32.png')));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(expressSanitizer());
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(require("express-session")({
    secret: "Secret",
    resave: true,
    saveUninitialized: true
}));

app.get('/feed/rss', async (req, res) => {
  let feed = new rss({
            title: 'K2 projekt rozwojowy - baza wiedzy',
            description: 'Konferencje, meetupy, warsztaty i przydatne linki.',
            feed_url: 'http://' + req.headers.host + '/feed/rss',
            site_url: 'http://' + req.headers.host,
            image_url: 'http' + req.headers.host + '/favicons/favicon-32x32.png',
            managingEditor: 'Nina Tymińska',
            language: 'pl',
        });
  try {
    await Course.find({}).sort({createdAt: -1}).limit(5).exec(function(err, allCourses) {
              allCourses.forEach(function(course, item) {
                feed.item({
                    title: course.name,
                    description: course.description,
                    url: 'http://' + req.headers.host + '/c/' + course.id,
                    author: course.author.name,
                    date: course.createdAt
                });      
              });
              res.type('rss');
              res.send(feed.xml());
          });
    } catch (err) {
      req.flash('error', 'Wystąpił błąd.');
       return res.redirect('back');
    }
});

app.locals.moment = require('moment');
app.locals.moment.locale('pl');

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async function(req, res, next){
  res.locals.currentUser = req.user;
  if(req.user) {
    try {
      let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
      res.locals.notifications = user.notifications.reverse();
    } catch(err) {
      req.flash("error", "Wystąpił błąd.");
    }
  }
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes, courseRoutes);
app.use("/c/:id/comments", commentRoutes);
app.use("/c/:id/reviews", reviewRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started.");
});