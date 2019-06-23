var express          = require("express"),
    app              = express(),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    passport         = require("passport"),
    expressSanitizer = require('express-sanitizer'),
    LocalStrategy    = require("passport-local"),
    methodOverride   = require("method-override"),
    flash            = require("connect-flash"),
    User             = require("./models/user");
    
var indexRoutes    = require("./routes/index"),
    courseRoutes   = require("./routes/courses"),
    commentRoutes  = require("./routes/comments"),
    reviewRoutes   = require("./routes/reviews");
    
mongoose.connect("mongodb+srv://Nina:k2_projekt666@cluster0-yab5c.mongodb.net/k2-projekt-rozwojowy?retryWrites=true&w=majority", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
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

app.locals.moment = require('moment');
app.locals.moment.updateLocale('pl', {
    relativeTime : {
        future: "za %s",
        past: "%s",
        s: "kilka sekund temu",
        ss: function (number){
            if(number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
                return number + ' sekundy temu';
            } else {
                return number + ' sekund temu';
            }
        },
        m:  "minutę temu",
        mm: function (number){
            if(number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
                return number + ' minuty temu';
            } else {
                return number + ' minut temu';
            }
        },
        h:  "godzinę temu",
        hh: function (number){
            if(number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
                return number + ' godziny temu';
            } else {
                return number + ' godzin temu';
            }
        },
        d:  "wczoraj",
        dd: "%d dni temu",
        M:  "miesiąc temu",
        MM: function (number){
            if(number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
                return number + ' miesiące temu';
            } else {
                return number + ' miesięcy temu';
            }
        },
        y:  "rok temu",
        yy: function (number){
            if(number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) {
                return number + ' lata temu';
            } else {
                return number + ' lat temu';
            }
        },
    }
});

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

// app.listen(process.env.PORT, process.env.IP, function(){
//     console.log("Server has started.");
// });

app.listen(3000, function(){
    console.log("Server has started.");
});