var express = require('express');
var app = express();
var PORT = process.env.PORT || 3100;
var parser = require('body-parser');
var _ = require('underscore');
var list = require('./moduleExports/list.js');
app.use(parser.json());


// ============= POST FUNCTION =============//
app.post('/list', function(req, res){
var body = _.pick(req.body, description, completed, due, priority);
var itemID = 0;
function errorStatus(){
    return res.status(400).send();
  }

//validate data types, send a 400 error if bad data
if(body.hasOwnProperty('completed') && !_.isBOOLEAN(body.completed) || body.description.trim().length === 0){
  return errorStatus();
}
if(body.hasOwnProperty('dateComplete') && !_.isDate(body.dateComplete)){
  return errorStatus();
}
if(!body.hasOwnProperty('description') || !_.isSTRING(body.description)){
  return errorStatus();
}
if(body.hasOwnProperty('due') && !_.isDate(body.due)){
  return errorStatus();
}
if (body.hasOwnProperty('priority') && !_.isNumber(body.priority)){
  return errorStatus();
}

body.id = itemID;
itemID ++;

res.json(body);

}); //end Post


// ===========  GET AND PARAMS ============//
app.get('/list', function(req, res){
  var query = req.query;
  var filteredList = list;

  //Check to see if query is asking for completed
  if(query.hasOwnProperty('completed')){
    if(query.completed === 'true'){
      filteredList = _.where(filteredList, {
        completed: true
      }); //end where
    } //end if true
    if(query.completed === 'false'){
      filteredList = _.where(filteredList, {
        completed: false
      }); //end where
    } // end if false
  } //end if has Own Property

  //Check to see if query is asking for description (aka 'q')
  //and find items that match the description
  if(query.hasOwnProperty('q')){
    filteredList = _.filter(filteredList, function(item){
      return item.description.toLowerCase().indexOf(q.toLowerCase()) > -1;
    });
  }

//TODO: Filter by due date
//TODO: Filter by priority

  //send back results
 if(filteredList.length > 0){
  res.json(filteredList);
 } else {
  res.send('No items found');
 }

}); //end GET

// ======== GET INDIVIDUAL ITEM (GET) ========//
app.get('/list/:id', function(req, res){
  var itemID = parseInt(req.params.id);
  var matching = _.findWhere(list, {id: itemID});
  if(matching){
    res.json(matching);
  } else {
    res.status(404).send();
  }
});

app.listen(PORT, function(){
  console.log('App listening on port ' + PORT);
});
