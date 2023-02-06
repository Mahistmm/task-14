const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const passportlocalmongoose = require("passport-local-mongoose");
const session = require("express-session");

const app = express();
app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "mahi1234",
    resave: true,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect(
  "mongodb+srv://Mahi:stmmsara@clusterfsb.opmw8qr.mongodb.net/hospital-management?retryWrites=true&w=majority"
);

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

UserSchema.plugin(passportlocalmongoose);

const User = new mongoose.model("users", UserSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const Patients = new mongoose.model("patients", {
  id: Number,
  name: String,
  age: Number,
  address: String,
  mobileno: Number,
  diseas: String,
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/admin", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("admin");
  } else {
    res.redirect("/");
  }
});

app.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("register");
  } else {
    res.redirect("/");
  }
});

app.get("/search", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("search", {
      option: "search",
      buttonName: "search",
      url: "search",
    });
  } else {
    res.redirect("/");
  }
});

app.get("/update", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("search", {
      option: "update",
      buttonName: "search",
      url: "update",
    });
  } else {
    res.redirect("/");
  }
});

app.get("/delete", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("delete");
  } else {
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.post("/", (req, res) => {
  // User.register({username:req.body.username},req.body.password).then((user)=>{
  //     passport.authenticate("local")(req,res,()=>{
  //         res.redirect("/")
  //     })
  // })

  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, req, () => {
        res.redirect("/admin");
      });
    }
  });
});

app.post("/admin", (req, res) => {
  const patients = new Patients(req.body);
  patients.save().then(() => {
    res.render("success", {
      subTitle: "Success",
      subject: "added",
    });
  });
});

app.post("/search", (req, res) => {
  Patients.findOne({ id: req.body.id }).then((data) => {
    if (data) {
      res.render("searchresultS", data);
    } else {
      res.render("searchfailure", {
        url: "search",
      });
    }
  });
});

app.post("/update", (req, res) => {
    Patients.findOne({ id: req.body.id }).then((data) => {
      if (data) {
        res.render("update", data);
      } else {
        res.render("searchfailure", {
          url: "search",
        });
      }
    });
  });

  app.post("/updateresults", (req, res) => {
    console.log(req.body);
    Patients.findOneAndUpdate({id: req.body.id},req.body).then(()=>{
     res.render("success", {
         subTitle: "Updated",
         subject: "updated",
       })
    })
   });
 

app.listen(4000, () => {
  console.log("Server is up and running");
});
