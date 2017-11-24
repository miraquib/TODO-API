var express = require('express');
var app = express();

var PORT = process.env.PORT || 3000;

var todos = [{
        id: 1,
        descriptioon: 'Get up for gym',
        status: false
 },
    {
        id: 2,
        descriptioon: 'Get to market',
        status: false
},
    {
        id: 3,
        descriptioon: 'complete the web-app project',
        status: true

}]

app.get('/', function (req, res) {
    res.send('To Do api Root!');
});

app.get('/todos', (req, res) => {
    res.json(todos);
});

app.get(`/todos/:id`, (req, res) => {
    var todoId = parseInt(req.params.id, 10);
    console.log(todoId);
    var matchedTodo;
    
    todos.forEach(function (todo) {
        if(todoId === todo.id){
            matchedTodo = todo;
        }
    });
    
    if(matchedTodo) {
        res.json(matchedTodo);
    }
    else {
        res.status(404).send();
    }
})

app.listen(PORT, function() {
    console.log("TODO Express app is running on Port: " + PORT);
});