const session = require('express-session');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const PORT = 5555;
const todoRoutes = express.Router();
let Todo = require('./model/todo.model');

app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  name: "sid",
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
  }
}));


var issue2options = {
  origin: [/localhost/],
  methods: ['POST', 'GET'],
  credentials: true,
  maxAge: 3600,
  "preflightContinue": false,
  optionsSuccessStatus: 204,
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
};
app.options('*', cors(issue2options));
app.use(cors(issue2options));
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/todos1', {
  useNewUrlParser: true,
  user: 'root',
  pass: 'example'
});
const connection = mongoose.connection;

connection.once('open', function () {
  console.log('successfully connected to mongo db');
});

app.listen(PORT, function () {
  console.log("Server is running on Port: " + PORT);
})

/**
 * Custom middleware
 */

const redirectHome = (req, res, next) => {
  if (req.session.userId) {
    res.json({ login: true });
    // resp.redirect("/home");
  } else {
    next();
  }
}

function getUsers() {
  return Todo.find(function (err, users) {
    if (err) {
      console.error(err);
      return [];
    } else {
      return users;
    }
  });
}

app.post('/register', function (req, res) {
  const { username, password } = req.body;
  // if exists already and say already registered

  getUsers()
    .then(users => {
      const user = users.find(user => user.username === username);
      if (user) {
        // already registered
        res.json();
      } else {
        console.log("not registered user");
        bcrypt.hash(password, saltRounds, function (err, hash) {


          if (!err) {
            let newUser = {
              username: username,
              password: hash,
              todos: []
            }

            const todo = new Todo(newUser);
            todo.save()
              .then(r => {
                res.status(200).json({ register: true });
              })
          }
        });
      }
    }).catch(e => res.json({ register: false }));
});

// GET /logout
app.get('/logout', function (req, res, next) {
  console.log('logout');
  if (req.session) {
    console.log('logout - 1');
    // delete session object
    req.session.destroy(function (err) {
      console.log("session destroyed");
      if (err) {
        return next(err);
      } else {
        return res.status(200).send();
      }
    });
  } else {
    console.log("logout no session exists");
  }

});

app.post('/login', redirectHome, function (req, res) {
  const { username, password } = req.body;
  // verify the login
  getUsers()
    .then(users => {
      const user = users.find(userObj => userObj.username === username);
      if (user) {
        console.log("logged in user");
        console.log({ user });
        const passwordHash = user.password;
        bcrypt.compare(password, passwordHash, function (err, bres) {
          if (err) {
            console.error("error in comparing passwords ", err);
            res.json({ login: false, error: 'passwors mismatch' });
          } else {
            if (bres) {
              // send the successful response
              //res.redirect("/home");
              req.session.userId = user.username;
              console.log({ requserId: req.session.userId })
              res.json({ login: true });
            }
          }
        });
      } else {
        console.log('user not found 404');
        res.json({ login: false })
      }
    })
});

todoRoutes.get('/', function (req, res) {
  console.log("todos");
  console.log(req.session)
  //console.log(req);
  getUsers()
    .then(users => {
      // how to get current use
      console.log({ reqUserId: req.session.userId });
      const userObj = users.find(userObj => userObj.username === req.session.userId);
      if (userObj) {
        console.log({ todos: userObj.todos });
        res.json(userObj.todos);
      }
    });
});

todoRoutes.get('/:id', function (req, res) {
  console.log("todo with id");
  const id = req.params.id;
  Todo.findById(id, function (err, todo) {
    if (err) {
      console.error(err);
    } else {
      console.log('get: fetched todo with id');
      res.json(todo);
    }
  });
});

todoRoutes.post('/add', function (req, res) {
  console.log("todo with add body");
  console.log({ body: req.body });
  getUsers()
    .then(users => {
      // how to get current use
      const userId = req.session.userId;
      console.log({ users, userId });
      const userObj = users.find(userObj => userObj.username === userId);

      if (userObj) {
        const user = userObj;
        const newTodos = user.todos;
        newTodos.push(req.body);
        console.log({ newTodos });


        Todo.findOneAndUpdate(
          { username: userId },
          {
            todos: newTodos
          },
          {
            new: true,
            runValidators: true,
          }
        )
          .then(addResp => {
            console.log('successfully added');
            console.log(addResp)
            res.status(200).json({ 'todo': 'todo add successfully' });
          })
          .catch(err => {
            console.error("error in added todo " + err.message);
            res.status(400).send('adding new todo failed')
          });
      } else {
        res.status(400).send('adding new todo failed, user not found');
      }
    });
});

todoRoutes.post('/update/:id', function (req, res) {
  console.log("todo with update");
  const id = req.params.id;
  Todo.findById(id, function (err, todo) {
    if (err) {
      console.error(err);
    } else {
      console.log('update: fetched todo with id');
      todo.description = req.body.description;
      todo.responsibility = req.body.responsibility;
      todo.priority = req.body.priority;
      todo.completed = req.body.completed;

      todo.save()
        .then(todo => {
          console.log('update: save succesfully');
          return res.json('updated')
        })
        .catch(err => {
          console.error("error in updating todo " + err.message);
          res.status(400).send('update failed')
        });
    }
  });
});

app.use('/todos', todoRoutes);