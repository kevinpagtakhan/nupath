//post model

var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
  content: {type: String, trim: true},
  _by: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  active: {type: Boolean, default: true}
  },
{timestamps: true});

var postSchema = mongoose.Schema({
  _by: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  content: {type: String, trim: true},
  polarity: String,
  subjectivity: String,
  polarity_confidence: Number,
  subjectivity_confidence: Number,
  comments: [commentSchema],
  active: {type: Boolean, default: true}
},
{timestamps: true});

var Post = mongoose.model('Post', postSchema)

module.exports = Post
