//Comment controllers
var Post = require('../models/Post.js');
var User = require('../models/User.js')

//models exports/ Comment VERBS

module.exports = {
  index: function(req, res){
      Post.findById(req.params.id, {active: true}).exec(function(err, data){
        if (err) return res.json(err);
          res.json(data);
        });
},
  create: function(req, res){
    Post.findById(req.params.id, function(err, data){
          // data._by = req.user.id;
          var newComment = new Object();
          newComment.content = req.body.content;
          newComment._by = req.user.id;
          data.comments.push(newComment);
          var newComment = data.comments[data.comments.length - 1];
          data.save(function(err){
            if(err) return res.json(err);
            Post.findById(req.params.id).populate('comments._by').exec(function(err, post){
              if(err) return res.json(err);
              res.json(post.comments)
            })
          });
        })
  },
  show: function(req, res) {
    Post.findById(req.params.postId).populate('users').exec(function(err, data){
      if(err) return res.json(err);
      res.json(data.comments.id(req.params.commentId))
    })
  },

  update: function(req, res) {
      //edit(existing comment)
      Post.findById(req.params.postId, function(err, data){
            if(err) return res.json(err);
            var comment = data.comments.id(req.params.commentId);
            comment.content = req.body.content;
            data.save(function(err){
              if(err) return res.json(err);
              res.json(data)
            });
          })
    },

    destroy: function(req, res) {
      //delete a comment
      Post.findById(req.params.postId).populate('comments._by').exec(function(err, data) {
        if (err) {
          res.json(err);
        } else {
          var comment = data.comments.id(req.params.commentId);
          comment.active = false;
          data.save(function(err){
            if(err) return res.json(err);
            res.json(data.comments)
          });
        }
      });
    }
};
