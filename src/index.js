const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(element => element.username == username);
  if(user) {
    next();

  }
  response.status(404)
  return response.json({ message: "Usuário não encontrado" });;
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExist = users.find(user => user.username == username);
  if(userExist) {
    response.status(400).json({error: 'Mensagem do erro'});
    return response;
  }

  const newUser = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }

  users.push(newUser);
  response.status(201);
  return response.json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find(element => element.username == username);
  if(user) {
    response.status(200).json(user.todos);  
    return response;
  }  
  response.status(404);
  return response;
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const task = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  users.forEach(user => {
    if(user.username == username) {
      user.todos.push(task);
    }
  });
  response.status(201).json(task);
  return response;

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username == username);

  user.todos.forEach(task => {
    if(task.id == id) {
      task.title = title,
      task.deadline = deadline

      response.status(200).json(task);
      return response;
    }
  });

  response.status(404).json({error: 'Mensagem do erro'});
  return response;
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const user = users.find(user => user.username == username);
  console.log(user.todos.length)

  if(user && user.todos.length > 0) {
    user.todos.forEach(task => {
      if(task.id === id) {
        task.done = true;
        response.status(200).json(task);
        return response;
      }
    });
  }

    return response.status(404).json({message: 'Mensagem do erro'});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username == username);

  user.todos.forEach((task, index) => {
   if(task.id == id) {
     user.todos = user.todos.splice(index, index);
     response.status(204);
     return response;
    }
  });

  response.status(404).json({
    error: 'Mensagem do erro'
  });
  return response;
});

module.exports = app;