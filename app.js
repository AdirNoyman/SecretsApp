//jshint esversion:6
require('dotenv').config();
const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const encrypt    = require('mongoose-encryption');

const key = process.env.SECRET;

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Connect to mongoDB ******************************************
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

// Create mongoose USER schema ******************************************************
const userSchema = new mongoose.Schema ({
    email: {type: String, required: "WTF??? ...where is the email???....ASSHOLE!!!"},
    password: {type: String, required: "WTF??? ...where is the password???....ASSHOLE!!!"}
  });

  // Adding encryption plugin to mongoose
  userSchema.plugin(encrypt, { secret: key, encryptedFields: ['password']});

  // Create mongoose USER model ******************************************************

  const User = mongoose.model("User", userSchema);

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

app.post("/register", (req, res) => {

    const email = req.body.username;
    const password = req.body.password;

    const newUser = new User ({email,password});

    newUser.save( err => {

        if (!err) {

            res.render("secrets");

        } else {

            res.send(err);
        }


    });

});

app.post("/login", (req, res) => {

    const email = req.body.username;

    User.findOne({email}, (err, userFound) => {

        if (err) {

            console.log(err);

        } else if (userFound) {

            res.render("secrets");

        } else {

            res.send("Sorry, wrong password");
        }

    });

});
// Server listen on port 3000 *************************************
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => console.log('Server has started succesfully!'));