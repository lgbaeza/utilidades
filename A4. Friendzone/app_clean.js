/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

var watson = require('watson-developer-cloud');
var bodyParser = require('body-parser');


// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var session = require('express-session');
app.set('trust proxy', 1) // trust first proxy 
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

function compare(a,b) {
  if (a.score < b.score)
    return -1;
  if (a.score > b.score)
    return 1;
  return 0;
}

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

app.get('/sendMessage', function (req, res) {
  
  var sess = req.session;
  var message = req.query.message;

  var workspaceId = "{conversation-workspace-id}";
  var conversation = watson.conversation({
    username: '{conversation-username}',
    password: '{conversation-password}',
    version: 'v1',
    version_date: '2017-04-21'
  });

  var context2 = {
    "sentimiento":"null"
  };
  if(req.query.restart == undefined)
  {
    context2 = sess.context;

  }

  var parameters = {
    'text': message,
    'features':{
      'emotions': true
    }
  };
  
  //Call Watson Tone Analyzer Service
  //var tone = new watson.ToneAnalyzerV3();

  conversation.message({
    workspace_id: workspaceId,
    input: {'text': message},
    context: context2
  },  function(err, response) {
      sess.context = response.context;

      var msgOut = response.output.text[0];
      res.send(msgOut)
  });

});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
