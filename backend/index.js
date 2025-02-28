require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "todos",
};

// MySQL 接続リトライ処理
let db;
const connectWithRetry = () => {
    db = mysql.createConnection(dbConfig);
    db.connect((err) => {
        if (err) {
            console.error("MySQL接続エラー。5秒後に再試行:", err);
            setTimeout(connectWithRetry, 5000); // 5秒後にリトライ
        } else {
            console.log("MySQLに接続成功！");

            // テーブル作成
            db.query(
                `CREATE TABLE IF NOT EXISTS todos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          text VARCHAR(255) NOT NULL,
          completed BOOLEAN DEFAULT false
        );`,
                (err) => {
                    if (err) console.error("テーブル作成エラー:", err);
                }
            );
        }
    });
};

// MySQL接続を開始
connectWithRetry();

// Todo一覧取得API（ソート順を追加）
app.get("/todos", (req, res) => {
    const sortOrder = req.query.sort === "asc" ? "ASC" : "DESC"; // クエリパラメータでソート指定
    db.query(`SELECT * FROM todos ORDER BY completed ASC, id ${sortOrder}`, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});


// Todo追加API
app.post("/todos", (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "テキストが必要です" });

    db.query("INSERT INTO todos (text, completed) VALUES (?, false)", [text], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        // 追加後、最新のデータを取得して返す
        db.query("SELECT * FROM todos WHERE id = ?", [result.insertId], (err, newTodo) => {
            if (err) return res.status(500).json({ error: err });
            res.json(newTodo[0]); // フロントに返す
        });
    });
});


// Todo削除API
app.delete("/todos/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM todos WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "削除成功" });
    });
});

// `completed` を切り替えるAPI
app.put("/todos/:id/toggle", (req, res) => {
    const { id } = req.params;

    // 現在の `completed` の値を取得
    db.query("SELECT completed FROM todos WHERE id = ?", [id], (err, rows) => {
        if (err) return res.status(500).json({ error: "データ取得エラー" });

        if (rows.length === 0) return res.status(404).json({ error: "Todoが見つかりません" });

        const currentCompleted = rows[0].completed;
        const newCompleted = currentCompleted ? 0 : 1; // 0 ⇄ 1 のトグル

        // `completed` の値を更新
        db.query("UPDATE todos SET completed = ? WHERE id = ?", [newCompleted, id], (err) => {
            if (err) return res.status(500).json({ error: "更新エラー" });

            // 更新後のデータをフロントに返す
            res.json({ id, completed: newCompleted });
        });
    });
});

app.listen(5000, () => console.log("Server is running on http://localhost:5000"));
