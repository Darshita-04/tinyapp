const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


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
  // let result = '';
  // const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  // const charactersLength = characters.length;
  // let counter = 0;
  // while (counter < 6) {
  //   result += characters.charAt(Math.floor(Math.random() * charactersLength));
  //   counter += 1;
  // }
  return Math.random().toString(36).substring(2,8);

}

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
  res.cookie("username", req.body.username);
  res.redirect(`/urls`);
});

// logout

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(`/urls`);
});

// register page

app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
})

// user registration
app.post("/register", (req, res) => {
  const id = generateRandomString(); // generate 6 char long random string
  let email =  req.body.email;
  let password = req.body.password
  users[id] = {
    id,
    email,
    password
  }; 
  res.cookie("user_id", id);   
  console.log(users);
  res.redirect(`/urls`);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});