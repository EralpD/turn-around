require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");

var app = express();

const saltRounds = 10;

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"));

app.use(session({
    secret: "Secret mustn't be revealed",
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}

})); // session middleware ın  !!!!!!!!!! passport middleware ından 

app.use(passport.initialize());
app.use(passport.session());



app.set("view engine", "ejs");

mongoose.connect("mongodb://127.0.0.1:27017/usersDB");

app.listen(3000, () => {
    console.log("the port has started with 3000")
})

// console.log(md5("message"));


const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);
   
// .plugin(encrypt, {encryptionKey: process.env.ENCKEY, signingKey: process.env.SIGKEY, encryptedFields: ["password"]})

// console.log(process.env.ENCKEY);
// console.log(process.env.SIGKEY);

const User = new mongoose.model("User", userSchema);

passport.use(new  LocalStrategy(User.authenticate()));

passport.serializeUser(function(user, done){
    done(null, user.id);
});

/*
passport.deserializeUser(async function(id, done){
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
*/
passport.deserializeUser(function(id, done){
    User.findById(id).then(users => {
        done(null, users);
    }).catch(err => {
        done(err);
    });
}); 



app.route("/")
.get((req, res) => {

    res.render("home");
})
// -----

app.get("/secrets",  (req, res) => {
    if(req.isAuthenticated()){
        res.render("secrets");
    } else{
        res.redirect("/login");
    }
        
})


// -----

app.route("/login")
.get((req, res) => {
    res.render("login");
})

.post((req, res) => {

    const user = new User({
        email: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){

        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            })
        }
    })

    
})

// -----

app.route("/register")
.get((req, res) => {
    res.render("register");
})

.post((req, res) => {
    User.register({username: req.body.username, active: false}, req.body.password, function(err, result){
        if(err){
            console.log(err);
            res.redirect("/register");
        } else{
            passport.authenticate("local", {failureRedirect: "/register"})(req, res, function(){
                res.redirect("/secrets");
            })
        }


    })
            });

// --------------------------------

app.get("/logout", (req, res) => {
    req.logout(function(err){
        if(err){
            console.log(err);
        }
    });
    res.redirect("/");
})

