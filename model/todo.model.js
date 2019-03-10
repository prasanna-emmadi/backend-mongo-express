const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// add user here
// {
//  user: {
//    username: {
//      type: String
//    },
//    password: {
//      type: String
//    },
//    todos: {
//      description: {
//        type: String
//      },
//      responsible: {
//        type: String
//      },
//      priority: {
//        type: String
//      },
//      completed: {
//        type: Boolean
//      }
//    }
//  }
// 
let Todo = new Schema({
  username: {
    type: String
  },
  password: {
    type: String
  },
  todos: [{
    description: {
      type: String
    },
    responsible: {
      type: String
    },
    priority: {
      type: String
    },
    completed: {
      type: Boolean
    }
  }]
});

module.exports = mongoose.model('Todo', Todo);