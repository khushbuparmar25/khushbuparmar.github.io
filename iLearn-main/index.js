require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const courses = require("./courses.json");
const mysql = require("mysql");
const session = require("express-session");
const path = require("path");

var connection = mysql.createConnection({
    host:process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

connection.connect((err) => {
    if (!err) {
        console.log("DB connection successfull !!");
    }
    else {
        console.log("DB connection failed");
    }
});

const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: true }));

var message = "";

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/help",(req, res)=>{
    res.render("help");
});

app.get("/help2",(req, res)=>{
    res.render("help2");
});

app.get("/quiz",(req, res)=>{
    res.render("quiz");
});

app.get("/quiz/:name",(req, res)=>{
    res.render("quiz-"+req.params.name);
});

app.get("/about",(req,res)=>{
    res.render("about");
});

app.get("/about2",(req, res)=>{
    res.render("about2");
});

app.get("/watch-list",(req, res)=>{
    res.render("watch-list");
});

app.get("/dashboard", (req, res) => {
    if (req.session.loggedin) {
        res.render("dashboard", { email: req.session.email, courses: courses });
    }
    else {
        res.render("home", { message: "Please login first" });
    }
});

app.get("/forgotPassword",(req, res)=>{
    res.render("forgotPassword",{message: message});
});

app.get("/logout",(req, res)=>{
    req.session.destroy((err)=>{
        if(!err){
            res.redirect("/");
        }
        else{
            console.log(err);
        }
    })
});

app.get("/watch-list2", (req, res) => {
    var email = req.session.email;
    var sql = "SELECT * FROM courses WHERE email=?";
    connection.query(sql, [email], (err, results, field) => {
        if (!err) {
            if(results.length>0){
                res.render("watch-list2", {results: results });
            }
            else{
                res.render("empty-list");
            }
        }
        else {
            res.send(err);
        }
    });
});

app.get("/login",(req, res)=>{
    res.render("login",{message:message});
});

app.get("/register",(req, res)=>{
    res.render("register",{message:message});
});

app.get("/python",(req, res)=>{
    res.render("python");
});

app.post("/dashboard", (req, res) => {
    var id = req.query.id;
    var name = courses[id - 1].name;
    var src = courses[id-1].src;
    var email = req.session.email;

    connection.query("SELECT * FROM courses WHERE email=? and name=?", [email, name], (err, rows, field) => {
        if (!err) {
            if (rows.length == 0) {
                var sql = "INSERT INTO courses(email, name, src) VALUES(?,?,?)"
                connection.query(sql, [email, name, src], (err) => {
                    if (!err) {
                        console.log("Course is added to watch-later successfully !!");
                        res.redirect("/dashboard");
                    }
                    else {
                        console.log(err);
                        console.log("Failed");
                    }
                });
            }
            else{
                res.redirect("/dashboard");
                console.log("The course has already been added to your bucket");
            }
        }
    })
});

app.post("/forgotPassword",(req, res)=>{
    var email = req.body.email;
    var password = req.body.password;
    var confirmPass = req.body.confirmPass;
    mysqlConnection.query("SELECT * FROM accounts WHERE email=?",[email],(err,results,field)=>{
        if(!err){
            if(results.length>0){
                if(password==confirmPass){
                    mysqlConnection.query("UPDATE Users SET password = ? WHERE email = ?",[hash,email],(err,results,fiels)=>{
                        if(!err){
                            res.render("login",{message:"Password is set successfully. Login again"});
                            console.log("Password set successfully !!");
                        }
                        else{
                            console.log(err);
                            console.log("Failed");
                        }
                    })
                }else{
                    res.render("forgotPassword",{message:"Confirm pasword does not match"});
                }
            }else{
                res.render("forgotPassword",{message:"You have entered an incorrect email id"});
            }
        }else{
            console.log(err);
            console.log("Failed")
        }
    })
});

app.post("/register", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    if (email && password) {
        connection.query("INSERT INTO accounts(email,password) VALUES (?,?)", [email, password], (err, result, fields) => {
            if (!err) {
                req.session.loggedin = true;
                req.session.email = email;
                res.redirect("/dashboard");
            }
            else {
                message = "User not registered. Try Again";
                res.redirect("/");
            }
        })
    }
    else {
        message = "Please fill all the fields !!";
        res.redirect("/");
    }
});

app.post("/login", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    if (email && password) {
        connection.query("SELECT * FROM accounts WHERE email=? AND password=?", [email, password], (err, result, fields) => {
            if (!err) {
                if (result.length > 0) {
                    req.session.loggedin = true;
                    req.session.email = email;
                    res.redirect("/dashboard");
                }
                else {
                    message = "Incorrect email id or password";
                    res.redirect("/");
                }
            }
        })
    }
    else {
        message = "Please fill all the fields !!";
        res.redirect("/");
    }
});

app.listen(3000, () => {
    console.log("Server is up and running on port 3000");
});