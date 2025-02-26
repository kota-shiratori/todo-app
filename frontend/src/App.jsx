import React, { useState } from "react";

const App = () => {
    const [task, setTask] = useState("");
    const [todos, setTodos] = useState([]);

    // タスクを追加
    const addTodo = () => {
        if (task.trim() === "") return;
        setTodos([...todos, { id: Date.now(), text: task, completed: false }]);
        setTask(""); // 入力欄をリセット
    };

    // タスクを削除
    const deleteTodo = (id) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Todoアプリ</h1>
            <input
                type="text"
                placeholder="新しいタスク..."
                value={task}
                onChange={(e) => setTask(e.target.value)}
            />
            <button onClick={addTodo}>追加</button>

            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        {todo.text}
                        <button onClick={() => deleteTodo(todo.id)}>削除</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
