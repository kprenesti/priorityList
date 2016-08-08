var express = require('express');
var app = express();
var PORT = process.env.PORT || 3100;
var parser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

app.use(parser.json());



// ============= POST FUNCTIONS =============//

app.post('/list', function(req, res){
var body = _.pick(req.body, 'description', 'completed','due', 'priority');

  db.items.create(body).then(function(item){
    res.json(item.toJSON());
  }, function(e){
    res.status(400).json(e)
  });


}); //end Post /list

app.post('/user', function(req, res){
  var body = _.pick(req.body, 'name', 'email', 'password');
  db.user.create(body).then(function(user){
    res.json(user.toJSON());
  }, function(e){
    res.status(400).json(e);
  });
})


// ===========  GET AND PARAMS ============//
app.get('/', function(req, res) {
	res.send('Priority List API Root');
});

app.get('/list', function(req, res){
  var query = req.query;
  var where = {};

  //Check to see if query is asking for completed
  if(query.hasOwnProperty('completed')){
    if(query.completed === 'true'){
      where.completed = true;
    } //end if true
    if(query.completed === 'false'){
      where.completed = false;
    } // end if false
  } //end if has Own Property

  //Check to see if query is asking for description (aka 'q')
  //and find items that match the description
  if(query.hasOwnProperty('q')){
    where.description = {
      $like: '%'+query.q+'%'
    };
  }

if(query.hasOwnProperty('priority')){
  where.priority = query.priority;
} else {
  where.priority = 2;
}

  //send back results
 db.items.findAll({where: where}).then(function (items){
     res.json(items);
 }, function(e){
   res.status(404).json(e);
 });

}); //end GET

// ======== GET INDIVIDUAL ITEM (GET) ========//
app.get('/list/:id', function(req, res){
  var itemID = parseInt(req.params.id, 10);
  db.items.findById(itemID).then(function(item){
    res.json(item);
  }, function(e){
    res.status(404).json(e);
  });
});


//============= DELETE INDIVIDUAL ITEMS BY ID ========//
app.delete('/list/:id', function(req, res){
  var itemID = parseInt(req.params.id);
  db.items.destroy({where: {id: itemID}}).then(function(rowsDeleted){
    if(rowsDeleted === 0){
      res.status(404).json({error: 'No item with that id found.'});
    } else {
      res.staus(204).send('Item successfully deleted');
    }
  }, function(e){
    res.status(500).json(e);
  });
}); //end delete


//============ UPDATE ITEM (PUT) ============//
app.put('/list/:id', function(req, res){
  //Step 1: Figure out which item is being updated
  var body = _.pick(req.body, 'description', 'completed','due', 'priority');
  var itemID = Number(req.params.id);
  var validAtts = {};

  //Step 3: Make sure the request is valid

  if(body.hasOwnProperty('completed')){
    validAtts.completed = body.completed;
  }
  if(body.hasOwnProperty('description')){
    validAtts.description = body.description;
  }
  if(body.hasOwnProperty('due')){
    validAtts.due = body.due;
  }
  if(body.hasOwnProperty('priority')){
    validAtts.priority = body.priority;
  }

  db.items.findById(itemID).then(function(item){
    if(item){
      return item.update(validAtts)
      .then(function(item){
        res.json(item.toJSON());
      }, function(e){
        res.status(404).send();
      });
    }
  }, function(e){
    res.status(500).json(e);
  })


}); //end app.put


db.sequelize.sync({force: true}).then(function(){
  app.listen(PORT, function(){
    console.log('App is listening on port '+PORT);
  });
});
