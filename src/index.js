const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const foundUser = users.find((user) => user.username === username);

  if (foundUser) {
    request.username = foundUser;
    return next();
  }

  return response.status(400).json({ error: "User not found" });
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find((user) => user.username === username);
  users.map((user) => console.log(user));

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  return response.status(200).json(username.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  const newTask = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  username.todos.push(newTask);

  return response.status(201).json(newTask);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username: user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const foundTodo = user.todos.find((todo) => todo.id === id);
  if (!foundTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.map((todo) => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = new Date(deadline);
      todo.done = false;
      return response.status(200).json(todo);
    }
  });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username: user } = request;
  const { id } = request.params;

  const userHasTodo = user.todos.find((todo) => todo.id === id);
  if (!userHasTodo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.map((todo) => {
    if (todo.id === id) {
      todo.done = true;
      return response.status(200).json(todo);
    }
  });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username: user } = request;
  const { id } = request.params;

  userHasTodo = user.todos.find((todo) => todo.id === id);

  if (!userHasTodo) {
    response.status(404).json({ error: "Todo not found" });
  }

  const newUserTodos = user.todos.filter((todo) => todo.id !== id);

  user.todos = newUserTodos;

  return response.status(204).send();
});

module.exports = app;
