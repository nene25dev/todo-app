import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("backend server ok");
});

app.get("/todos", (_req, res) => {
  res.json([
    { id: 1, text: "牛乳を買う", completed: false },
    { id: 2, text: "洗濯する", completed: true }
  ]);
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});