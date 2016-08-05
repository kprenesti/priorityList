var express = require('express');
var app = express();
var PORT = process.env.PORT || 3100;
var parser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var list = require('./moduleExports/list.js');
app.use(parser.json());



// ============= POST FUNCTION =============//
var itemID = 0;

app.post('/list', function(req, res){
var body = _.pick(req.body, 'description', 'completed','due', 'priority');

if(body.hasOwnProperty('completed')){
  list.create(body).then(function(item){
    res.json(item.toJSON());
  }, function(e){
    res.status(400).json(e);
  });
}

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
      return item.description.toLowerCase().indexOf(query.q.toLowerCase()) > -1;
    });
  }

if(query.hasOwnProperty('priority')&& _.isNumber(query.priority)){
  if(query.priority === 1){
    filteredList = _.where(filteredList, {priority:1});
  }
  if(query.priority === 2){
    filteredList = _.where(filteredList, {priority:2});
  }
  if(query.priority === 3){
    filteredList = _.where(filteredList, {priority:3});
  }
}

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


db.sequelize.sync().then(function(){
  app.listen(PORT, function(){
    console.log('App is listening on port '+PORT);
  })
});
