/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable no-undef */
//jshint esversion:6
require("dotenv").config();
const express               = require("express");
const app                   = express();
const bodyParser            = require("body-parser");
const mongoose              = require("mongoose");
const ejs                   = require("ejs");
const session               = require("express-session");
const passport              = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy        = require("passport-google-oauth20").Strategy;
const findOrCreate          = require("mongoose-find-or-create");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(session({
    secret: "The Monkey called the Donkey.",
    resave: false,
    saveUninitialized: false
    // cookie: { secure: true }
  }));

app.use(passport.initialize());
app.use(passport.session());


// Connect to mongoDB ******************************************
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

// Create mongoose USER schema ******************************************************
const userSchema = new mongoose.Schema ({
    email:    String,
    password: String,
    googleId: String,
    secret:   String
  });

  userSchema.plugin(passportLocalMongoose);
  userSchema.plugin(findOrCreate);

  // Create mongoose USER model ******************************************************

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
 
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

// Routes ******************************************************

app.get("/", (req, res) => {

    res.render("home");
});

app.get("/auth/google",

    passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets page.
    res.redirect("/secrets");
  });

app.get("/login", (req, res) => {

    res.render("login");
});

app.get("/register", (req, res) => {

    res.render("register");
});

app.get("/secrets", (req, res) => {

    User.find({"secret": {$ne: null}}, (err, foundUsers) => {

      if (err) {

        console.log(err);
      } else {

        if (foundUsers) {

          res.render("secrets", {userWithSecrets: foundUsers});

        }
      }

    }); 
});

app.get("/logout", (req, res) => {

    req.logOut();
    res.redirect("/");
});

app.get("/submit", (req, res) => {

  if (req.isAuthenticated()) {

    res.render("submit");

} else {

    res.redirect("/login");
}

  
});

app.post("/submit", (req, res) => {

  const submittedSecret = req.body.secret;

  console.log(req.user);

  User.findById(req.user.id, (err, foundUser) => {

    if (err) {

      console.log(err);

    } else {

      if (foundUser) {

        foundUser.secret = submittedSecret;
        foundUser.save(() => {

          res.redirect("/secrets");

        });
      }
    }

  });

  
});



app.post("/register", (req, res) => {


    User.register({username:req.body.username}, req.body.password, function(err, user) {


        if (err) {
            
            console.log(err);
            res.redirect("/register");
        
        } else {

            passport.authenticate("local") (req,res, function() {

                res.redirect("/secrets");
            });
        }
            });
        });
       
    //     const authenticate = User.authenticate();
    //     authenticate("username", "password", function(err, result) {
    //       if (err) { ... }
       
    //       // Value "result" is set to false. The user could not be authenticated since the user is not active
    //     });
    //   });


app.post("/login", (req, res) => {

    const user = new User({

        username: req.body.username,
        password: req.body.password

    });
    
    req.login(user, (err) => {
        if (err) {
            
            console.log(err);
         } else {

            passport.authenticate("local") (req,res, function() {

                res.redirect("/secrets");
            });
         }
       
      });


});
// Server listen on port 3000 *************************************
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => console.log("Server has started succesfully!"));