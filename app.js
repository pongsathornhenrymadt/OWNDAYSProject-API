const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Fake database
let todos = [
    {id: 1, task: 'Learn Node.js', complete: true},
    {id: 2, task: 'Learn Express.js', complete: true},
    {id: 3, task: 'Build a project', complete: false}
];

// Routes

// Get all todos
app.get('/todos', (req, res) =>{
    res.json(todos);
})

// Get a specific todo by id
app.get('/todos/:id', (req, res) =>{
    if (!todos.find(todo => todo.id === parseInt(req.params.id))) {
        return res.status(404).json({message: 'Todo not found'});
    }else{
        res.json(todos.find(todo => todo.id === parseInt(req.params.id)));
    }
})

// Create a new todo
app.post('/todos', (req,res) =>{
    // Validate request body
    const {task} = req.body;
    if(!task){
        return res.status(400).json({message: 'Task is required'});
    }

    // create id for new todo
    // find max id in todos and add 1
    // if todos is empty, start with id 1
    const newId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) +1 : 1;

    // create new todo object
    const newTodo = {
        id: newId,
        task: task,
        complete: false
    };
    // add new todo to todos array
    todos.push(newTodo);
    // return new todo with 201 status
    res.status(201).json(newTodo);
})

// Update a todo by id
app.put('/todos/:id', (req,res) =>{
    // check if todo with given id exists
    const idToUpdate = parseInt(req.params.id);
    
    // retrieve task and complete from request body
    const {task, complete} = req.body;

    // find the todo to update
    const todoToUpdate = todos.find(todo => todo.id === idToUpdate);

    if(!todoToUpdate){
        return res.status(404).json({message: 'Todo not found'});
    }

    // update the todo 
    if(task !== undefined){
        todoToUpdate.task = task;
    }
    if(complete !== undefined){
        todoToUpdate.complete = complete;
    }

    // return updated todo
    res.json(todoToUpdate);
})

// Delete a todo by id
app.delete('/todos/:id', (req,res) =>{
    // check if todo with given id exists
    const idToDelete = parseInt(req.params.id);
    // find index of the todo to delete
    const indexToDelete = todos.findIndex(todo => todo.id === idToDelete);
    if(indexToDelete === -1){
        return res.status(404).json({message: 'Todo not found'});
    }else{
        // remove the todo from todos array
        todos.splice(indexToDelete, 1);
    }

    // return success message
    res.status(204).send();

})

//listen
app.listen(PORT, ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
})