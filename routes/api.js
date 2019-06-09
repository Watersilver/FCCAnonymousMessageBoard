/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const ObjectID = require("mongodb").ObjectID;

module.exports = function (app, db) {
  
  app.route('/api/threads/:board')
    .get((req, res) => {
    const board = req.params.board;
    
    db.collection(board).find(
      {},
      {
        // Sort by date bumped
        sort: {bumped_on: -1},
        // Return at most 10 threads
        limit: 10,
        // Handle fields to be returned
        projection : {
          // Only return at most the last three replies.
          replies: { $slice: -3 },
          // Don't return
          reported: 0,
          delete_password: 0,
          "replies.reported": 0,
          "replies.delete_password": 0
        }
      })
      .toArray(function(err, docs) {
      if (err) return res.send(err);
      
      res.json(docs);
    });
  })
    .post((req, res) => {
    const board = req.params.board;
    const text = req.body.text;
    if (!text) return res.send("Please enter text")
    const delete_password = req.body.delete_password;
    if (!delete_password) return res.send("Please enter delete_password");
    const currDate = Date.now();
    
    db.collection(board).insertOne(
      {
        text,
        created_on: currDate,
        bumped_on: currDate,
        reported: false,
        delete_password,
        replies: []
      }
    )
      .then(insertOneWriteOpResult => res.redirect('/b/' + board))
      .catch(err => console.error(err));
  })
    .put((req, res) => {
    const board = req.params.board;
    const thread_id = req.body.thread_id;
    if (!thread_id) return res.send("Please send thread_id to be reported.");
    
    let obId;
    try {
      obId = ObjectID(thread_id);
    }
    catch(err) {
      console.error(err);
      return res.send("incorrect ID");
    }
    
    db.collection(board).updateOne(
      {_id: obId},
      {$set: {reported: true}}
    )
      .then(result => {
      if (!result.modifiedCount) return res.send("Couldn't find thread");
      else res.send("success");
    })
      .catch(err => console.error(err));
  })
    .delete((req, res) => {
    const board = req.params.board;
    const thread_id = req.body.thread_id;
    if (!thread_id) return res.send("Please send thread_id to be deleted.");
    const delete_password = req.body.delete_password;
    if (!delete_password) return res.send("Please enter delete password.");
    
    let obId;
    try {
      obId = ObjectID(thread_id);
    }
    catch(err) {
      console.error(err);
      return res.send("incorrect ID");
    }
    
    db.collection(board).deleteOne({
      _id: obId,
      delete_password
    })
    .then(deleteWriteOpResult => {
      // If nothing was deleted assume that it was because of incorrect password
      if (!deleteWriteOpResult.deletedCount) return res.send("incorrect password");
      else return res.send("success");
    })
    .catch(err => {
      res.send("Delete unsuccessful")
    });
  });
    
  app.route('/api/replies/:board')
    .get((req, res) => {
    const board = req.params.board;
    const thread_id = req.query.thread_id;
    if (!thread_id) return res.send("Please enter thread id in query string.");
    
    let obId;
    try {
      obId = ObjectID(thread_id);
    }
    catch(err) {
      console.error(err);
      return res.send("incorrect ID");
    }
    
    db.collection(board).find(
      {_id: obId},
      {
        projection : {
          // Don't return
          reported: 0,
          delete_password: 0,
          "replies.reported": 0,
          "replies.delete_password": 0
        }
      })
      .toArray(function(err, docs) {
      if (err) return res.send(err);
      
      res.json(docs);
    });
  })
    .post((req, res) => {
    const board = req.params.board;
    const text = req.body.text;
    if (!text) return res.send("Please enter text.")
    const delete_password = req.body.delete_password;
    if (!delete_password) return res.send("Please enter delete_password");
    const thread_id = req.body.thread_id;
    if (!thread_id) return res.send("Please send thread_id to be deleted.");
    const created_on = Date.now();
    
    let obId;
    try {
      obId = ObjectID(thread_id);
    }
    catch(err) {
      console.error(err);
      return res.send("incorrect ID");
    }
    
    db.collection(board).updateOne(
      {_id: obId},
      {
        $set: {bumped_on: Date.now()},
        $push: {
          replies: {
            _id: new ObjectID(),
            text,
            created_on,
            delete_password,
            reported: false
          }
        }
      }
    )
      .then(updateWriteOpResult => {
      if (!updateWriteOpResult.modifiedCount) return res.send("Wrong board name or thread id")
      else return res.redirect('/b/'+board+'/'+thread_id)
    })
      .catch(err => {
      console.error(err);
      res.send("Error. Check console.")
    })
  })
  .put((req, res) => {
    const board = req.params.board;
    const thread_id = req.body.thread_id;
    if (!thread_id) return res.send("Please send thread_id to be reported.");
    
    let threadId;
    try {
      threadId = ObjectID(thread_id);
    }
    catch(err) {
      console.error(err);
      return res.send("incorrect thread ID");
    }
    
    const reply_id = req.body.reply_id;
    if (!reply_id) return res.send("Please send reply_id to be reported.");
    
    let replyId;
    try {
      replyId = ObjectID(reply_id);
    }
    catch(err) {
      console.error(err);
      return res.send("incorrect reply ID");
    }
    
    db.collection(board).updateOne(
      {
        _id: threadId,
        "replies._id": replyId
      },
      {
        // The $ is the positional operator
        // I need to include the array I use it on in the query, or it doesn't work
        $set: {"replies.$.reported": true}
      }
    )
    .then(updateWriteOpResult => {
      if (!updateWriteOpResult.modifiedCount) return res.send("Failed to report");
      else return res.send("success");
    })
    .catch(err => {
      console.error(err);
      res.send("Error while looking for thread and reply.")
    })
    
  })
  .delete((req, res) => {
    const board = req.params.board;
    const delete_password = req.body.delete_password;
    if (!delete_password) return res.send("Please enter delete password.");
    const thread_id = req.body.thread_id;
    if (!thread_id) return res.send("Please send thread_id to be deleted.");
    
    let threadId;
    try {
      threadId = ObjectID(thread_id);
    }
    catch(err) {
      console.error(err);
      return res.send("incorrect thread ID");
    }
    
    const reply_id = req.body.reply_id;
    if (!reply_id) return res.send("Please send reply_id to be deleted.");
    
    let replyId;
    try {
      replyId = ObjectID(reply_id);
    }
    catch(err) {
      console.error(err);
      return res.send("incorrect reply ID");
    }
    
    db.collection(board).updateOne(
      {
        _id: threadId,
        "replies._id": replyId
      },
      {
        // The $ is the positional operator
        // I need to include the array I use it on in the query, or it doesn't work
        $set: {"replies.$.text": "[deleted]"}
      }
    )
    .then(updateWriteOpResult => {
      if (!updateWriteOpResult.modifiedCount) return res.send("incorrect password");
      else return res.send("success");
    })
    .catch(err => {
      console.error(err);
      res.send("Error while looking for thread and reply.")
    })
  });

};
