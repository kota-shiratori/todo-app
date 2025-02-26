import React, { useState } from "react";
import "./App.css";

const App = () => {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);

  // タスクを追加
  const addTodo = () => {
    if (task.trim() === "") return;
    setTodos([...todos, { id: Date.now(), text: task, completed: false }]);
    setTask("");
  };

  // タスクを削除
  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // タスクの完了状態を切り替え
  const toggleComplete = (id) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  return (
    <div className="container">
      <h1>📝 Todo アプリ</h1>
      <div className="input-container">
        <input type="text" placeholder="新しいタスク..." value={task} onChange={(e) => setTask(e.target.value)} />
        <button onClick={addTodo}>追加</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <span onClick={() => toggleComplete(todo.id)}>{todo.text}</span>
            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
