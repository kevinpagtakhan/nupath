var User = require('../models/User.js');

module.exports = {
  index: function(req, res){
    User.findById(req.params.id).exec(function(err, data){
      if(err) return res.json(err);
      res.json(data.achievements)
    })
  },

  create: function(req, res) {
    User.findById(req.params.id, function(err, data){
      if (err) {
        res.json(err);
      } else {
        data.achievements.push(req.body);
        console.log(data.achievements)
        data.save(function(err){
          if (err) {
            res.json(err);
          } else {
            res.json(data)
          }
        });
      }
    })
  },

  // new: function(req, res){
  //
  // },

  show: function(req, res) {
      User.findById(req.params.id, function(err, data){
        if(err) return res.json(err);
        res.json(data.achievements.id(req.params.achId))
      })
  },

  edit: function(req, res){

  },

  update: function(req, res) {

  },

  delete: function(req, res) {
    User.findById(req.params.id, function(err, data){
      console.log(data.achievements);
      if (err) {return res.json(err);}
      else{
      data.achievements.id(req.params.achId).active = false
      data.save(function(err){
        if(err) return res.json(err);
        res.json(data.achievements.id(req.params.achId));
      })
    }
    })
  }
};
