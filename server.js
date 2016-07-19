var express = require('express');
var app = express();
var PORT = process.env.PORT || 3100;
var parser = require('body-parser');
var _ = require('underscore');
var list = require('./moduleExports/list.js');
app.use(parser.json());


// ============= POST FUNCTION =============//
var itemID = 0;

app.post('/list', function(req, res){
var body = _.pick(req.body, 'description', 'completed','due', 'priority');
function errorStatus(issue){
    return res.status(400).send(issue);
  }

//validate data types, send a 400 error if bad data
if(body.hasOwnProperty('completed') && !_.isBoolean(body.completed) || body.description.trim().length === 0){
  return errorStatus("Something is wrong with completed");
} else if(!body.hasOwnProperty('completed')){
  body.completed = false;
}
// if(body.hasOwnProperty('dateComplete') && !_.isDate(body.dateComplete)){
//   return errorStatus("Something is wrong with dateComplete");
// }
if(!body.hasOwnProperty('description') || !_.isString(body.description)){
  return errorStatus("Something is wrong with description");
}
if(body.hasOwnProperty('due') && !_.isString(body.due)){
  return errorStatus("Something is wrong with due");
}
if (body.hasOwnProperty('priority') && !_.isNumber(body.priority)){
  return errorStatus("Something is wrong with priority");
} else if(!body.hasOwnProperty('priority')){
  body.priority = 2; //regular priority
}

body.id = itemID;
list.push(body);
itemID++;

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

//============= DELETE INDIVIDUAL ITEMS BY ID ========//
app.delete('/list/:id', function(req, res){
  var itemID = parseInt(req.params.id);
  var matching = _.findWhere(list, {id: itemID});
  if(matching){
  list = _.without(list, matching);
    res.json(list);
  } else {
    res.status(400).send('Item not found.');
  }
}); //end delete


//============ UPDATE ITEM (PUT) ============//
app.put('/list/:id', function(req, res){
  //Step 1: Figure out which item is being updated
  var body = _.pick(req.body, 'description', 'completed','due', 'priority');
  var itemID = Number(req.params.id);
  var itemToChange = _.findWhere(list, {id: itemID});
  //Step 2: Establish a new object for updated properties to attach to.
  var validAtts = {};

  //Step 3: Make sure the request is valid
  if(!itemToChange){
    return  res.status(404).send('No item found.');
  }
    //Step 3.1: Validate requested changes
  if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
    validAtts.completed = body.completed;
  } else if(body.hasOwnProperty('completed')){
    return res.status(400).send('Error: Completed must be a boolean value.');
  }
  if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
    validAtts.description = body.description;
  } else if(body.hasOwnProperty('description') && _.isString(body.description)){
    return res.status(400).send('Error: Description length must be longer than 0 characters.')
  }
  if(body.hasOwnProperty('due') && _.isString(body.due)){
    validAtts.due = body.due;
  } else if(body.hasOwnProperty('due')){
    return res.status(400).send('Error: Due must be a string.');
  }
  if(body.hasOwnProperty('priority') && _.isNumber(body.priority) && Number(body.priority) > 0 && Number(body.priority) < 4){
    validAtts.priority = body.priority;
  } else if(body.hasOwnProperty('priority')){
    return res.status(400).send('Error: Priority level must be a numerical value between 1 and 3.');
  }

  //Step 4: Merge validAtts with original object
_.extend(itemToChange, validAtts);

  //Step 5: Send data
  res.json(itemToChange);
}); //end app.put
