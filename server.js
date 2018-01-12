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

    var queryParam = req.query;
    var filteredTodos = todos

    if(queryParam.hasOwnProperty('completed') && queryParam.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {completed: true});
        res.json(filteredTodos);
    } 
    else if(queryParam.hasOwnProperty('completed') && queryParam.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {completed: false});
        res.json(filteredTodos);
    } 

    if(queryParam.hasOwnProperty('q') && queryParam.q.length > 0) {
        filteredTodos = _.filter(filteredTodos,function(todo) {
            return todo.description.toLowerCase().indexOf(queryParam.q.toLowerCase()) > -1;
        });
    } 

    res.json(todos);
});

app.get(`/todos/:id`, (req, res) => {
    
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
   
    if(matchedTodo) {
        res.json(matchedTodo);
    }
    else {
        res.status(404).send();
    }
});

app.post('/todos', (req, res) => {
    var body = _.pick(req.body, 'description','completed','id');
    
    // call db.todo
    //  respond with 200 and todo
    //  or else respond 404 and error message

    db.todo.create(body).then(function (todo){
        res.json(todo.toJSON());
    }, function(e) {
        res.status(404).json(e);
    });
    
    // if(!_.isBoolean(body.completed) ||!_.isString(body.description) || body.description.trim().length=== 0) {
    //     return res.status(400).send();
    // }
    
    // body.description = body.description.trim();
    // body.id = todoNextId++;
    // todos.push(body);
    // res.json(body);
    
});

app.delete('/todos/:id', (req, res) => {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if(matchedTodo) {
        todos = _.without(todos, matchedTodo);
        res.json(todos);
    }
    else {
        res.status(404).json({"Error": "No TODO item Found"});
    }
});

app.put('/todos/:id', (req, res) => {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	var body = _.pick(req.body, 'description','completed');
	var validAttributes = {};

	if (!matchedTodo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function() {
        console.log("TODO Express app is running on Port: " + PORT);
    });
});
