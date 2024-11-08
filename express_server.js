const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 3000; // default port 3000

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


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

// check if an email already exists in the users object

const getUserByEmail = (email) => {
  for (let user in users) {
    if (users[user]['email'] === email) {
      return user;
    }
  }
  return null;
};

// generate random string for unique id

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

// filter URL for loggen in users

const urlsForUser = (id) => {
  const userUrls = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
}

app.get('/', (req, res) => {
  res.send('Hello!');
});

// shows list of URL combinations

app.get('/urls', (req, res) => {
    //if not logged in
    if (!req.cookies['user_id']) { 
      return res.redirect('/login');
    }
  
  const templateVars = { urls: urlsForUser(req.cookies['user_id']), user: users[req.cookies['user_id']]};
  res.render('urls_index', templateVars);
});

// redirects to new URL form page

app.get('/urls/new', (req, res) => {
  //if not logged in
  if (!req.cookies['user_id']) {    
    return res.redirect('/login');
  }
  const templateVars = {user: users[req.cookies['user_id']]};
  res.render('urls_new', templateVars);
});

// shows individual URL combination based on id

app.get('/urls/:id', (req, res) => {

    // if the URL not exists

    if (!urlDatabase[req.params.id]) {
      return res.status(404).send('<h2>URL ID not exist.</h2>');
    }

    //if not logged in

    if (!req.cookies['user_id']) {    
      return res.redirect('/login');
    }

    // check if the URL belongs to the logged in user

    if ( urlDatabase[req.params.id].userID !== req.cookies['user_id']) {
      return res.status(403).send('<h2>Unauthorized: You can only view your own URLs.</h2>');
    }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies['user_id']]};
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
  if (!req.cookies['user_id']) {
    return res.status(401).send('<h2>You cannot shorten URLs as you are not registered or logged in into app.</h2>');
  }
  const id = generateRandomString(); // generate 6 char long random string
  let longURL =  req.body.longURL;
  let userID =  req.cookies['user_id'];
  urlDatabase[id] = {
    longURL,
    userID
  } // updating urlDatabses

  console.log(urlDatabase)
  res.redirect(`/urls/${id}`);
});


// delete URL entry from main page (List of URLs)

app.post('/urls/:id/delete', (req, res) => {

  // if the URL not exists

  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('<h2>URL ID not exist.</h2>');
  }

  //if not logged in

  if (!req.cookies['user_id']) {    
    return res.status(401).send('<h2>You must be logged in to perform this action.</h2>');
  }

  // check if the URL belongs to the logged in user

  if ( urlDatabase[req.params.id].userID !== req.cookies['user_id']) {
    return res.status(403).send('<h2>Unauthorized: You can only delete your own URLs.</h2>');
  }

  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

// update long URL

app.post('/urls/:id', (req, res) => {

    // if the URL not exists

    if (!urlDatabase[req.params.id]) {
      return res.status(404).send('<h2>URL ID not exist.</h2>');
    }

    //if not logged in

    if (!req.cookies['user_id']) {    
      return res.status(401).send('<h2>You must be logged in to perform this action.</h2>');
    }

    // check if the URL belongs to the logged in user

    if ( urlDatabase[req.params.id].userID !== req.cookies['user_id']) {
      return res.status(403).send('<h2>Unauthorized: You can only edit your own URLs.</h2>');
    }

  urlDatabase[req.params.id].longURL =  req.body.longURL;
  res.redirect(`/urls/${req.params.id}`);
});

// login

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  const isPasswordValid = bcrypt.compareSync(password, users[user]['password']); 

  if (user === null) {
    return res.status(403).json({status: 403, message: 'A user with that email not exists, try to register instead'});
  } else if (!isPasswordValid) {
    return res.status(403).json({status: 403, message: 'Email or Password is incorrect.'});
  } else {
    res.cookie('user_id', user);
  }
  res.redirect(`/urls`);
});

// login page

app.get('/login', (req, res) => {
  // redirect to home page (/urls) when user already logged in
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: req.cookies['user_id'] ? users[req.cookies['user_id']] : null
  };
  res.render('login', templateVars);
});

// logout

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect(`/login`);
});

// register page

app.get('/register', (req, res) => {
  // redirect to home page (/urls) when user already logged in
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }

  const templateVars = {
    user: req.cookies['user_id'] ? users[req.cookies['user_id']] : null
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

  if (getUserByEmail(email) !== null) {
    return res.status(400).json({status: 400, message: 'User already exists, try logging in instead'});
  }
  users[id] = {
    id,
    email,
    password:hashedPassword
  };
  res.cookie('user_id', id);
  res.redirect(`/urls`);
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});