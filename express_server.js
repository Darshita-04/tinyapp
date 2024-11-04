const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3000; // default port 3000

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// check if an email already exists in the users object

const getUserByEmail = (email) => {
  for (let user in users) {
    if (users[user]['email'] === email) {
      return user;
    }
  }
  return null;
};
app.get("/", (req, res) => {
  res.send("Hello!");
});

// shows list of URL combinations

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

// redirects to new URL form page

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

// shows individual URL combination based on id

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
});
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

// adds new URL combo to urlDatabase and redirects to that URL page

app.post("/urls", (req, res) => {
  const id = generateRandomString(); // generate 6 char long random string
  urlDatabase[id] = req.body.longURL; // updating urlDatabses
  res.redirect(`/urls/${id}`);
});

// redirects to longURL when clicking on short URL

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// delete URL entry from main page (List of URLs)

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

// update long URL

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] =  req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

// login

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = getUserByEmail(email);
  if (user === null) {
    return res.status(403).json({status: 403, message: "A user with that email not exists, try to register instead"});
  } else if (password !== users[user]["password"]) {
    return res.status(403).json({status: 403, message: "Email or Password is incorrect."});
  } else {
    res.cookie("user_id", user);
  }
  res.redirect(`/urls`);
});

// logout

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/login`);
});

// register page

app.get("/register", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"] ? users[req.cookies["user_id"]] : null
  };
  res.render("register", templateVars);
});

// user registration
app.post("/register", (req, res) => {
  const id = generateRandomString(); // generate 6 char long random string
  let email =  req.body.email;
  let password = req.body.password;

  if (email === "" || password === "") {
    return res.status(400).json({status: 400, message: "Email and password fields cannot be empty"});
  }

  if (getUserByEmail(email) !== null) {
    return res.status(400).json({status: 400, message: "A user with that email already exists, try to login instead"});
  }

  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);
  res.redirect(`/urls`);
});

// login page

app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"] ? users[req.cookies["user_id"]] : null
  };
  res.render("login", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});