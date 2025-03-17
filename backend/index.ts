import dotenv from "dotenv";
import express, { Request, Response } from "express";
import mysql from "mysql2";

dotenv.config();

const app = express();
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "todos",
};

const db = mysql.createConnection(dbConfig);

// MySQL 接続リトライ処理
const connectWithRetry = () => {
    db.connect((err) => {
        if (err) {
            console.error("MySQL接続エラー", err);
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log("MySQLに接続成功！");
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

connectWithRetry();

// CORS対応
import cors from "cors";
app.use(cors());

// Todoリスト取得
app.get("/", (req: Request, res: Response) => {
    const sortOrder = req.query.sort === "asc" ? "ASC" : "DESC";
    db.query(`SELECT * FROM todos ORDER BY completed ASC, id ${sortOrder}`, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Todo追加
app.post("/todos", (req: Request, res: Response) => {
    const { text } = req.body;
    db.query("INSERT INTO todos (text, completed) VALUES (?, false)", [text], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        db.query("SELECT * FROM todos WHERE id = ?", [result.insertId], (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            res.json(rows[0]);
        });
    });
});

// Todo削除
app.delete("/todos/:id", (req: Request, res: Response) => {
    const { id } = req.params;
    db.query("DELETE FROM todos WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "削除成功" });
    });
});

// Todo完了状態切り替え
app.patch("/todos/:id/toggle", (req: Request, res: Response) => {
    const { id } = req.params;
    db.query("SELECT completed FROM todos WHERE id = ?", [id], (err, rows) => {
        if (err) return res.status(500).json({ error: "データ取得エラー" });
        if (rows.length === 0) return res.status(404).json({ error: "Todoが見つかりません" });
        const newCompleted = !rows[0].completed;
        db.query("UPDATE todos SET completed = ? WHERE id = ?", [newCompleted, id], (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ id: req.params.id, completed: newCompleted });
        });
    });
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});