var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if(env === 'development') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        'dialect': 'postgres'
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/basic-sqlite-database.sqlite'
    });
}

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 256]
        }

    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

sequelize.sync(
    {force: true}
).then(function(){
    console.log("Everything is Synced");

    Todo.create({
        description: 'Walk the Dog',
    }).then(function(todo){

        return Todo.create({
            description:'Clean the Office'
        })
    }).then(function(todo){
        return Todo.findAll({
            where: {
                description: {
                    $like: "%clean%"
                }
            }
        })
    }).then(function(todos){
        if(todos) {
            todos.forEach(function(todo){
                console.log(todo.toJSON());
            })
        } else {
            console.log("No TODO items")
        }
        }).catch(function(e){
            console.log(e);
        });
});