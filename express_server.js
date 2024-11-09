const express = require('express');
const methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getUserByEmail, urlsForUser } = require("./helpers.js");
const app = express();
const PORT = 3000; // default port 3000

const key = crypto.randomBytes(32).toString('base64');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: [key]
}));
app.use(methodOverride('_method'));


const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
  },
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

// generate random string for unique id

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};



app.get('/', (req, res) => {
  res.send('Hello!');
});

// shows list of URL combinations

app.get('/urls', (req, res) => {
  //if not logged in
  if (!req.session.userID) {
    return res.redirect('/login');
  }
  
  const templateVars = { urls: urlsForUser(req.session.userID,urlDatabase), user: users[req.session.userID]};
  res.render('urls_index', templateVars);
});

// redirects to new URL form page

app.get('/urls/new', (req, res) => {
  //if not logged in
  if (!req.session.userID) {
    return res.redirect('/login');
  }
  const templateVars = {user: users[req.session.userID]};
  res.render('urls_new', templateVars);
});

// shows individual URL combination based on id

app.get('/urls/:id', (req, res) => {

  // if the URL not exists

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('<h2>URL ID not exist.</h2>');
  }

  //if not logged in

  if (!req.session.userID) {
    return res.redirect('/login');
  }

  // check if the URL belongs to the logged in user

  if (urlDatabase[req.params.id].userID !== req.session.userID) {
    return res.status(403).send('<h2>Unauthorized: You can only view your own URLs.</h2>');
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.userID]};
  res.render('urls_show', templateVars);
});

// redirects to longURL when clicking on short URL

app.get('/u/:id', (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('<h2>You are trying to visit a URL that does not exist. Please check again.</h2>');
  }
  res.redirect(urlDatabase[req.params.id].longURL);
});

// adds new URL combo to urlDatabase and redirects to that URL page

app.post('/urls', (req, res) => {
  // if logged in then only able to shorten URLs
  if (!req.session.userID) {
    return res.status(401).send('<h2>You cannot shorten URLs as you are not registered or logged in into app.</h2>');
  }
  const id = generateRandomString(); // generate 6 char long random string
  let longURL =  req.body.longURL;
  let userID =  req.session.userID;
  urlDatabase[id] = {
    longURL,
    userID
  }; // updating urlDatabses
  res.redirect(`/urls/${id}`);
});


// delete URL entry from main page (List of URLs)

app.delete('/urls/:id/delete', (req, res) => {

  // if the URL not exists

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('<h2>URL ID not exist.</h2>');
  }

  //if not logged in

  if (!req.session.userID) {
    return res.status(401).send('<h2>You must be logged in to perform this action.</h2>');
  }

  // check if the URL belongs to the logged in user

  if (urlDatabase[req.params.id].userID !== req.session.userID) {
    return res.status(403).send('<h2>Unauthorized: You can only delete your own URLs.</h2>');
  }

  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

// update long URL

app.put('/urls/:id', (req, res) => {

  // if the URL not exists

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('<h2>URL ID not exist.</h2>');
  }

  //if not logged in

  if (!req.session.userID) {
    return res.status(401).send('<h2>You must be logged in to perform this action.</h2>');
  }

  // check if the URL belongs to the logged in user

  if (urlDatabase[req.params.id].userID !== req.session.userID) {
    return res.status(403).send('<h2>Unauthorized: You can only edit your own URLs.</h2>');
  }

  urlDatabase[req.params.id].longURL =  req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

// login page

app.get('/login', (req, res) => {
  // redirect to home page (/urls) when user already logged in
  if (req.session.userID) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: req.session.userID ? users[req.session.userID] : null
  };
  res.render('login', templateVars);
});

// login

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email,users);

  if (user === null) {
    return res.status(403).json({status: 403, message: 'A user with that email not exists, try to register instead'});
  }
  
  const isPasswordValid = bcrypt.compareSync(password, users[user]['password']);
  if (!isPasswordValid) {
    return res.status(403).json({status: 403, message: 'Email or Password is incorrect.'});
  }

  req.session.userID = user;
  res.redirect(`/urls`);
});


// logout

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect(`/login`);
});

// register page

app.get('/register', (req, res) => {
  // redirect to home page (/urls) when user already logged in
  if (req.session.userID) {
    return res.redirect('/urls');
  }

  const templateVars = {
    user: req.session.userID ? users[req.session.userID] : null
  };
  
  res.render('register', templateVars);
});

// user registration
app.post('/register', (req, res) => {
  const id = generateRandomString(); // generate 6 char long random string
  const email =  req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === '' || password === '') {
    return res.status(400).json({status: 400, message: 'Email and password cannot be empty'});
  }

  if (getUserByEmail(email,users) !== null) {
    return res.status(400).json({status: 400, message: 'User already exists, try logging in instead'});
  }
  users[id] = {
    id,
    email,
    password:hashedPassword
  };
  req.session.userID = id;
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});