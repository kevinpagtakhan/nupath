//Users controller

var User = require('../models/User.js');
var aws = require('aws-sdk');

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
  	User.findById(req.params.id).populate({path:'posts messageThreads', populate:{path:'comments._by messages users'} }).exec(function(err, data){
    	if (err) {
      	res.json(err);
      } else {
      	// res.render('users/show', {data: data});
        res.json({user:data})
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
  },

  upload: function(req, res){
    var s3 = new aws.S3();
    var fileName = req.query['file-name'];
    var fileType = req.query['file-type'];
    const s3Params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Expires: 60,
      ContentType: fileType,
      ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, function(err, data){
      if(err) {
        console.log(err);
        return res.end();
      }
      const returnData = {
        signedData: data,
        url: 'https://' + process.env.AWS_BUCKET_NAME + '.s3.amazonaws.com/' + fileName
      }
      res.write(JSON.stringify(returnData));
      res.end();
    })
  }
}
