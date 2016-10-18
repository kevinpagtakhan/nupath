//Users controller

var User = require('../models/User.js');

module.exports = {

  index: function(req, res){
  	User.find({active: true},function(err, data){
    	if (err) {
      	res.json(err);
      } else {
        res.json(data);
      	// res.render('users/index', {data: data});
      }
    });
  },

  show: function(req, res){
  	User.findById(req.params.id).populate({path:'posts', populate:{path:'comments._by'} }).exec(function(err, data){
    	if (err) {
      	res.json(err);
      } else {
      	res.render('users/show', {data: data});
        // res.json({user:data})
      }
    });
  },

  new: function(req, res){
  	res.sendFile('users/new.js');
  },

  create: function(req, res){
    User.findById(req.params.id).exec(function(err, data){
      if(err) return res.json(err);
      res.json(data.local.name)
    })
  },

  edit: function(req, res){
  	res.sendFile('users/update.js');
  },

  update: function(req, res){
  	User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, data){
    	if (err) {
      	res.json(err);
      } else {
      	res.json(data);
      }
    });
  },

  delete: function(req, res){
    User.findByIdAndUpdate(req.params.id, {active: false}, {new: true}, function(err, data){
    	if (err) {
      	res.json(err);
      } else {
      	res.json(data);
      }
    });
  },

  login: function(req, res){
    res.render('authenticate/login')
  },

  signup: function(req, res){
    res.render('authenticate/signup', {message: req.flash('signupMessage')})
  },

  threads: function(req, res){
    User.findById(req.params.id).populate('messageThreads').exec(function(err, data){
      if (err) {
        res.json(err);
      } else {
        res.json(data.messageThreads);
      }
    })
  }
}
