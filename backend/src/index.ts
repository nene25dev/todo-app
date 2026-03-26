import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import todoRoutes from "./routes/todoRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors(
  {
    // アクセスを許可するフロントのURL
    origin:process.env.CLIENT_URL,
    // Cookieや認証情報を一緒に送るのを許可する
    credentials: true
  }
));
app.use(express.json());

// リクエストに含まれる Cookie をサーバー側で読み取れるようにする
app.use(cookieParser());

app.use("/register", authRoutes);
app.use("/todos", todoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
