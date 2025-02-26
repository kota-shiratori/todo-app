import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/todos";

const App = () => {
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc"); // デフォルトは新しい順

  // ✅ Todoリストを取得
  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_URL}?sort=${sortOrder}`);
      if (!res.ok) throw new Error("サーバーエラー");
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Todo取得エラー:", error);
    }
  };

  // ✅ 初回 & ソート変更時にTodoを取得
  useEffect(() => {
    fetchTodos();
  }, [sortOrder]);

  // ✅ Todoを追加
  const addTodo = () => {
    if (task.trim() === "") return;

    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: task }),
    })
      .then((res) => res.json())
      .then((newTodo) => {
        setTodos((prevTodos) => [newTodo, ...prevTodos]); // 即座に追加
        fetchTodos(); // 最新の一覧を取得
      })
      .catch((err) => console.error("追加エラー:", err));

    setTask(""); // 入力欄をクリア
  };

  // ✅ Todoの完了状態を切り替え
  const toggleTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("サーバーエラー");

      const updatedTodo = await res.json();
      console.log("🟢 更新されたTodo:", updatedTodo); // ✅ レスポンス確認用

      // ✅ リストを更新
      setTodos((prevTodos) => prevTodos.map((todo) => (todo.id === id ? { ...todo, completed: updatedTodo.completed } : todo)));
    } catch (err) {
      console.error("完了状態の更新エラー:", err);
    }
  };

  // ✅ Todoを削除
  const deleteTodo = (id) => {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then(() => setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id)))
      .catch((err) => console.error("削除エラー:", err));
  };

  return (
    <div className="container">
      <h1>📝 Todoアプリ</h1>

      <button className="sort-btn" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
        {sortOrder === "asc" ? "新しい順 🔽" : "古い順 🔼"}
      </button>

      <div className="input-container">
        <input type="text" placeholder="新しいタスクを入力..." value={task} onChange={(e) => setTask(e.target.value)} />
        <button className="add-btn" onClick={addTodo}>
          追加
        </button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
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
