require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// MYSQL DATABASE CCONNECTION

const mysql = require("mysql");

var mysqlConnection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

mysqlConnection.connect((err)=>{
    if(!err){
        console.log("DB is connected successfully !!");
    }
    else{
        console.log("DB connection failed !!");
    }
});

// SETTING THE APP
const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var message="";

app.get("/",(req, res)=>{
    res.render("home");
});

app.get("/login",(req, res)=>{
    res.render("login",{message:""});
});

app.get("/register",(req, res)=>{
    res.render("register",{message:""});
});

app.get("/forgotPassword",(req,res)=>{
    res.render("forgotPassword",{message:""});
});

app.get("/watch-list",(req, res)=>{
    res.render("watch-list")
});

app.get("/about",(req, res)=>{
    res.render("about")
});

app.get("/help",(req, res)=>{
    res.render("help")
});

app.get("/quiz",(req,res)=>{
    res.render("quiz")
});

app.get("/quiz/:topic",(req, res)=>{
    var quiz_topic = req.params.topic;
    res.render("quiz-"+quiz_topic);
});

app.get("/watch-list2",(req,res)=>{
    res.render("watch-list2")
});

app.get("/about2",(req,res)=>{
    res.render("about2")
});

app.get("/help2",(req,res)=>{
    res.render("help2")
});

app.post("/forgotPassword",(req, res)=>{
    var email = req.body.email;
    var password = req.body.password;
    var confirmPass = req.body.confirmPass;
    mysqlConnection.query("SELECT * FROM Users WHERE email=?",[email],(err,results,field)=>{
        if(!err){
            if(results.length>0){
                if(password==confirmPass){
                    bcrypt.hash(password,saltRounds,(err,hash)=>{
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

app.post("/login",(req, res)=>{
    var email=req.body.email;
    var password=req.body.password;
    mysqlConnection.query("SELECT * FROM Users WHERE email=?",[email],(err,results,field)=>{
        if(!err){
            if(results.length>0){
                bcrypt.compare(password,results[0].password,(err,check)=>{
                    if(!err && check){
                        console.log("The user has successfully logged in !!");
                        res.render("dashboard",{firstname: results[0].firstname});
                    }
                    else{
                        console.log("Failed");
                        res.render("login",{message:"Password entered is incorrect"});
                    }
                })
            }
            else{
                res.render("login",{message:"Please enter your registered email id"});
            }
        }else{
            console.log("Failed");
        }
    })

});

app.post("/register",(req, res)=>{
    var firstname=req.body.firstname;
    var lastname=req.body.lastname;
    var email=req.body.email;
    var password=req.body.password;
    var confirmPass=req.body.confirmPass;
    if(password==confirmPass){
        mysqlConnection.query("SELECT * FROM Users WHERE email=?",[email],(err,results,field)=>{
            if(results.length>0){
                message="This email has already been registered";
                res.render("register",{message:message});
            }
            else{
                bcrypt.hash(password,saltRounds,(err,hash)=>{
                    if(!err){
                        mysqlConnection.query("INSERT INTO Users (firstname,lastname,email,password) VALUES(?,?,?,?)",[firstname,lastname,email,hash],(err,results,field)=>{
                            if(!err){
                                console.log("User has successfully registered !!");
                                res.render("dashboard",{firstname: firstname});
                            }
                            else{
                                console.log(err)
                                console.log("Failed !!");
                            }
                        })
                    }
                    else{
                        console.log("hash failed")
                    }
                }) 
            }
        })
    }else{
        message="Confirm password does not match";
        res.render("register",{message:message});
    }
});

app.listen(3000, ()=>{
    console.log("Server is up and running on port 3000");
});