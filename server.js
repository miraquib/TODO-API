var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./database.js');


var app = express();
var PORT = process.env.PORT || 3000;

var todos = []
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('To Do api Root!');
});

app.get('/todos', (req, res) => {

    var query = req.query;
    var where = {};

    if(query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if(query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: `%${query.p}%`
        }
    }

    db.todo.findAll({where: where}).then( function(todos) {
        res.json(todos);
    }, function(e) {
        res.status(500).send();
    })
});

app.get(`/todos/:id`, (req, res) => {
    
    var todoId = parseInt(req.params.id, 10);

    db.todo.findById(todoId).then(function (todo) {
        if (!!todo) {
            console.log(todo.toJSON());
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        } 
    }).catch(function(e){
        res.status(500).json(e);
    });
});

app.post('/todos', (req, res) => {
    var body = _.pick(req.body, 'description','completed');
    
    db.todo.create(body).then(function (todo){
        res.json(todo.toJSON());
    }, function(e) {
        res.status(404).json(e);
    });
    
});

app.delete('/todos/:id', (req, res) => {
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function (rowsDeleted){
        if(rowsDeleted === 0) {
            res.status(404).json({
                error: 'No TODO item with the given ID of ' + todoId + ' found'
            })
        } else {
            res.status(204).send();
        }    
    }).catch(function(e){
        res.status(500).json(e);
    });
});

app.put('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description','completed');
    var attributes = {};
    
	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	} 

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
    }

    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);
            })
        } else {
            res.status(404).send();
        }
    }, function () {
        res.status(500).send();
    })
});

app.post('/users', (req, res) => {
    var body = _.pick(req.body, 'email','password');
    
    db.user.create(body).then(function (user){
        res.json(user.toJSON());
    }, function(e) {
        res.status(404).json(e);
    });
    
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function() {
        console.log("TODO Express app is running on Port: " + PORT);
    });
});
