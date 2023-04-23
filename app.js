require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

var app = express()

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"));

app.set("view engine", "ejs");

mongoose.connect("mongodb://127.0.0.1:27017/usersDB");

app.listen(3000, () => {
    console.log("the port has started with 3000")
})



const userSchema = new mongoose
    .Schema({
    email: String,
    password: String
})
   
    .plugin(encrypt, {encryptionKey: process.env.ENCKEY, signingKey: process.env.SIGKEY, encryptedFields: ["password"]})

// console.log(process.env.ENCKEY);
// console.log(process.env.SIGKEY);

const User = new mongoose.model("User", userSchema);


app.route("/")
.get((req, res) => {
    res.render("home");
})


// -----

app.route("/login")
.get((req, res) => {
    res.render("login");
})

.post((req, res) => {
    const email = req.body.username;
    const password = req.body.password;



    User.findOne({email: email}).then(users => {

        console.log(users);

        if(users.password === password){
            res.render("secrets");
        }else{
            console.log("The account didn t found, please check again");
            res.redirect("/login");
        }
    }).catch((err) => {
        console.log(err);
    });
})

// -----

app.route("/register")
.get((req, res) => {
    res.render("register");
})

.post((req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save().then(() => {
        console.log("saved correctly");
        res.render("secrets");
    }).catch((err) => {
        console.log("there is an error -> " + err);
    });
})