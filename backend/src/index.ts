import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todoRoutes.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/todos", todoRoutes);

/* let todos: Todo[] = [
  {
    id: 1,
    value: "メールをまとめて返信する",
    checked: false,
    removed: false,
    deadline: "today",
    time: 20,
  },
  {
    id: 2,
    value: "リビングを片付ける",
    checked: false,
    removed: true,
    deadline: "tomorrow",
    time: 30,
  },
  {
    id: 3,
    value: "テストデータ追加",
    checked: true,
    removed: false,
    deadline: "today",
    time: 20,
  },
  {
    id: 4,
    value: "ReactのuseEffectを復習する",
    checked: false,
    removed: false,
    deadline: "idea",
    time: 30,
  },
  {
    id: 5,
    value: "スマホ表示を確認",
    checked: false,
    removed: false,
    deadline: "tomorrow",
    time: 10,
  },
]; */

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
