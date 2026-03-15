import express from "express";
import cors from "cors";
import todoRoutes from "./routes/todoRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use("/todos", todoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
