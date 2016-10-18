var User = require('../models/User.js');
var MessageThread = require('../models/MessageThread.js');
var Message = require('../models/Message.js');

var messageThreadController = {
  index: function(req, res){
    MessageThread.find({}).populate('users messages').exec(function(err, data){
      if (err) {
        res.json(err);
      } else {
        // res.render('threads/index', {data, data});
        res.json(data);
      }
    });
  },
  show: function(req, res){
    MessageThread.findById(req.params.id).populate({path: 'users messages', populate: {path: '_by'}}).exec(function(err, data){
      if (err) {
        res.json(err);
      } else {
        // res.render('threads/show', {data: data});
        res.json(data)
      }
    });
  },
  create: function(req, res){
    var thread = new MessageThread();
    thread.users.push(req.params.user1),
    thread.users.push(req.params.user2),
    thread.save(function(err){
      User.findById(req.params.user1, function(err, user1){
        user1.messageThreads.push(thread);
        user1.save(function(err){
          User.findById(req.params.user2, function(err, user2){
            user2.messageThreads.push(thread);
            user2.save(function(err){
              if (err) {
                res.json(err)
              } else {
                res.redirect('/messages');
              }
            })
          })
        })
      })
    })
  },
  delete: function(req, res){

  },

  addMessage: function(req, res){
    var newMessage = Message();
    newMessage.content = req.body.content;
    newMessage._by = req.user.id;
    newMessage.public = false;
    newMessage.save(function(err){
      if (err) {
        res.json(err);
      } else {
        MessageThread.findById(req.params.id, function(err, data){
          data.messages.push(newMessage);
          data.save(function(err){
            if (err) {
              res.json(err);
            } else {
              // res.json(newMessage);
              Message.populate(newMessage, {path: '_by'}, function (err, message) {
                if (err) {
                  res.json(err);
                } else {
                  res.json(message)
                }
              })
            }
          });
        })
      }
    });
  }
}

module.exports = messageThreadController;
