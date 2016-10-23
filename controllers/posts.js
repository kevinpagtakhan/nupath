//post controllers

var Post = require('../models/Post.js')
var User = require('../models/User.js')

var AYLIENTextAPI = require('aylien_textapi');
var textapi = new AYLIENTextAPI({
  application_id: process.env.TA_APP_ID,
  application_key: process.env.TA_KEY
});

//models exports/ POST VERBS
module.exports = {
  index: function(req, res){
    Post.find({active: true}).sort({createdAt: 'desc'}).populate('_by comments._by').exec(function(err, data){
      if (err) {
        res.json(err);
      } else {
        res.json(data)
        // res.render('posts/index', {data: data});
      }
    });
  },

  create: function(req, res) {
    textapi.sentiment({
      text: req.body.content,
      mode: 'tweet'
    }, function(err, response) {
      if(err){
        res.json(err);
        console.log(err);
      } else {
        console.log(response);
        User.findById(req.user.id, function(err, data){
          var newPost = new Post();
          newPost.content = req.body.content;
          newPost.polarity = response.polarity;
          newPost.subjectivity = response.subjectivity;
          newPost.polarity_confidence = response.polarity_confidence;
          newPost.subjectivity_confidence = response.subjectivity_confidence;
          newPost._by = req.user.id;
          newPost.save(function(err){
            if (err) {
              res.json(err);
            } else {
              data.posts.push(newPost);
              data.save(function(err){
                if (err) {
                  res.json(err);
                } else {
                  Post.populate(newPost, {path: '_by'}, function (err, post) {
                    if (err) {
                      res.json(err);
                    } else {
                      res.json(post)
                    }
                  })
                }
              })
            }
          })
        });
      }
    });
  },

  new: function(req, res){
    console.log('Hello');
    res.render('users/new')
  },

  show: function(req, res) {
    Post.findById(req.params.id).populate('_by comments._by').exec(function(err, data) {
      if (err) {
        res.json(err);
      } else {
        // res.render('posts/show', {post: data});
        res.json(data);
      }
    });
  },

  edit: function(req, res){
    res.render('users/edit')
  },

  update: function(req, res) {
      //edit(existing post)
      Post.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, data) {
        if (err) {
          res.json(err);
        } else {
          res.json(data);
        }
      });
    },

    destroy: function(req, res) {
      //delete a post
      Post.findByIdAndUpdate(req.params.id, {active: false}, {new: true}, function(err, data) {
        if (err) {
          res.json(err);
        } else {
          res.json(data);
        }
      });
    }
};
