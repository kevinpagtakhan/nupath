var
    dotenv = require('dotenv').load({silent: true}),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    logger = require('morgan'),
    mongoose = require('mongoose'),
    methodOveride = require('method-override'),
    bodyParser = require('body-parser'),
    ejs = require('ejs'),
    ejsLayouts = require('express-ejs-layouts'),
    flash = require('connect-flash'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    passport = require('passport'),
    passportConfig = require('./config/passport.js'),
    userRoutes = require('./routes/users.js'),
    User = require('./models/User.js'),
    request = require('request')

// Require chat message model
var Message = require('./models/Message.js');
var mongoConnection = process.env.MONGO_URL;

var port = process.env.PORT || 3000;

// <-- Start mongoDB connection
mongoose.connect(mongoConnection, function(err, db){
  console.log(mongoConnection);
  if (err) {
    console.log("Error: Could not connect to MongoDB.");
  } else {
    console.log("Success: Connected to MongoDB.");
  }
});
// -->

// <-- Start requiring routers

//all users route:
var userRoutes = require('./routes/users.js');
var chatRoutes = require('./routes/messages.js');
var authenticateRoutes = require('./routes/authenticate.js');
var postRoutes = require('./routes/posts.js');
var messageThreadsRoutes = require('./routes/messageThreads.js');
// End requiring routers -->

// <-- Start middleware

app.use(logger('dev'));
app.use(cookieParser());
app.use(methodOveride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
  secret: 'Tirevo',
  cookie: {maxAge: 6000000},
  resave: true,
  saveUninitialize: false,
  store: new MongoStore({url: mongoConnection})
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static('public'))

// Add a current user to be available in every view
app.use(function(req, res, next){
  if(req.user) req.app.locals.currentUser = req.user
  req.app.locals.loggedIn = !!req.user
  next()
})

// EJS configuration
app.set('view engine', 'ejs');
app.use(ejsLayouts);
// End middleware -->

// <-- Start using routes


app.get('/', function(req, res){
  res.redirect('/profile');
});

app.use('/', authenticateRoutes);

app.use(isLoggedIn);
app.use('/users', function(req, res){
  res.render('users/index.ejs');
});
app.use('/chat-messages', function(req, res){
  res.render('chat/index.ejs');
});
app.use('/posts', function(req, res){
  res.render('posts/index.ejs');
});
app.use('/messages', function(req, res){
  res.render('threads/index.ejs');
});

app.use('/api/users', userRoutes);
app.use('/api/chat-messages', chatRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageThreadsRoutes);

app.get('/api/giphy/:id', function(req, res){
  request('http://api.giphy.com/v1/gifs/search?q=' + req.params.id + '&api_key=dc6zaTOxFJmzC', function(err, response, body){
    res.json(err || JSON.parse(body));
  });
});


// end using routes -->

// app.get('/', function(req, res){
//   if(req.app.locals.loggedIn) return res.redirect('/profile')
//   res.redirect('/login')
// })

app.get('/chat', function(req, res){
  if(!io.nsps['/chat']){
    var chat = io.of('/chat');
    chat.on('connect', function(socket){
      console.log('A user has connected.');

      socket.on('new-chat', function(data){
        Message.create({_by: data.user, content: data.message, public: true}, function(err, data){
          if (err){
            chat.emit('broadcast-error', err);
          } else {
            Message.populate(data, {path: '_by'}, function (err, data) {
              if (err) {
                chat.emit('broadcast-error', err);
              } else {
                chat.emit('broadcast-chat', {user: data._by.local.name, message: data.content});
              }
            })
          }
        })

      });

      socket.on('new-giphy', function(data){
        Message.create({_by: data.user, content: data.message, content_type: 'giphy', public: true}, function(err, data){
          if (err){
            chat.emit('broadcast-error', err);
          } else {
            Message.populate(data, {path: '_by'}, function (err, data) {
              // console.log(err);
              if (err) {
                chat.emit('broadcast-error', err);
              } else {
                chat.emit('broadcast-giphy', {user: data._by.local.name, message: data.content});
              }
            })
          }
        })

      });

      socket.on('disconnect', function(){
        console.log('A user has disconnected.');
      })
    })
  }

  res.render('chat');
});

app.use('*', function(req, res){
  res.render('errPage', {title: "Fuck it's 404!"});
});
// end using routes -->

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()) return next()
	res.redirect('/login')
}


http.listen(port, function(err){
  if (err) {
    console.log("Error: Could not start server.");
  } else {
    console.log(`Success: Listening on port: ${port}`);
  }
})
