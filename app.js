/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable no-undef */
//jshint esversion:6
require('dotenv').config();
const express               = require('express');
const app                   = express();
const bodyParser            = require('body-parser');
const mongoose              = require('mongoose');
const ejs                   = require('ejs');
const session               = require('express-session');
const passport              = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(session({
    secret: 'The Monkey called the Donkey.',
    resave: false,
    saveUninitialized: false
    // cookie: { secure: true }
  }));

app.use(passport.initialize());
app.use(passport.session());


// Connect to mongoDB ******************************************
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);

// Create mongoose USER schema ******************************************************
const userSchema = new mongoose.Schema ({
    email: {type: String},
    password: {type: String}
  });

  userSchema.plugin(passportLocalMongoose);

  // Create mongoose USER model ******************************************************

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes ******************************************************

app.get("/", (req, res) => {

    res.render("home");
});

app.get("/login", (req, res) => {

    res.render("login");
});

app.get("/register", (req, res) => {

    res.render("register");
});

app.get("/secrets", (req, res) => {

    if (req.isAuthenticated()) {

        res.render("secrets");
    } else {

        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {

    req.logOut();
    res.redirect("/");
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
    //     authenticate('username', 'password', function(err, result) {
    //       if (err) { ... }
       
    //       // Value 'result' is set to false. The user could not be authenticated since the user is not active
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

app.listen(port, () => console.log('Server has started succesfully!'));