import { useCallback, useEffect, useState } from "react";
import { Form } from "./components/Form";
import "./App.css";
import { TodoSection } from "./components/TodoSection";
import type {
  Todo,
  Errors,
  Filter,
  Deadline,
} from "../../shared/types/";
import type {
  Section
} from "../types/index";
import { fetchTodos, createTodo, updateTodo, deleteTodo, updateTodoOrder } from "./api/todo";

// 残り時間取得
function getRemainingTime() {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  return diff;
}
// 時間形式を整形
function formatTime(diff: number) {
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours}時間 ${minutes}分 ${seconds}秒`;
}
// カウントダウン
function Countdown() {
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const update = () => {
      let diff = getRemainingTime();
      setCountdown(formatTime(diff));
    };

    update();
    let timer = setInterval(update, 1000);
    // コンポーネントが消えるときタイマー停止
    return () => clearInterval(timer);
  }, []);

  return countdown;
}

const TodayNote = ({ loading,message }: { loading: boolean,message:string }) => {
  return (
    <div className="box__content">
      <div className="row">
        <p className="text">※上限3件</p>
        <p className="text">
          {loading ? <span className="skeleton-countdown"></span> : <>明日まで残り： <Countdown /></>}
        </p>
      </div>
      {message && <p className="text --message">{message}</p>}
    </div>
  );
};

const App = () => {
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [deadline, setDeadline] = useState<Deadline>("idea");
  const [errors, setErrors] = useState<Errors>({});
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // バリデーション関数
  const varidateText = (text: string) => {
    // タスクが未入力だった場合
    if (!text.trim()) {
      return "文字を入力してください。";
    }
    return "";
  };
  const varidateTime = (time: string | number) => {
    const num = Number(time);
    // かかる時間 が空もしくは30より大きい場合
    if (isNaN(num) || num <= 0) {
      return "値を入力してください。";
    } else if (num > 30) {
      return "30分以内の値で入力してください。";
    }
    return "";
  };

  const varidateForm = (values: { text: string; time: string | number }) => {
    return {
      text: varidateText(values.text),
      time: varidateTime(values.time),
    };
  };

  // フォーカスアウトしたときのイベント
  const onBlur = (field: keyof Errors) => {
    // バリデーション結果を受け取る
    const result = varidateForm({ text, time });
    // エラー表示を更新
    setErrors((prev) => ({
      ...prev,
      [field]: result[field],
    }));
  };

  // 入力値を更新
  const handleText = (text: string) => {
    setText(text);
  };
  const handleTime = (time: string) => {
    setTime(time);
  };

  const handleSubmit = async () => {
    // バリデーション結果を受け取る
    const result = varidateForm({ text, time });
    // エラーを表示
    setErrors(result);

    // どれか1つでもエラーメッセージがあれば中断
    const hasError = Object.values(result).some((msg) => msg && msg.length > 0);
    if (hasError) return;

    const num = Number(time);

    // 「今日やる」追加上限を設定
    if (deadline === "today") {
      const todayCount = todos.filter(
        (todo) => todo.deadline === "today" && !todo.removed,
      ).length;

      if (todayCount >= 3) {
        alert("今日は既にやることがいっぱいです！💦");
        return;
      }
    }

    // try catch構文 エラーが発生する可能性があるコードを試して対処する
    try {
      const newTodo = await createTodo({
        value: text,
        deadline,
        time: num,
      });
      setTodos((todos) => [...todos, newTodo]);
      setText("");
    } catch (error) {
      // エラー発生時の処理
      console.error(error);
      alert("通信エラーが発生しました");
    }
  };

  const handleFilter = (filter: Filter) => {
    setFilter(filter);
  };
  const handleDeadline = (deadline: Deadline) => {
    setDeadline(deadline);
  };

  // 特定のタスクのプロパティを差し替え
  const handleTodo = async (id: number, updates: Partial<Todo>) => {
    try {
      const updatedTodo = await updateTodo(id, updates);

      setTodos((todos) =>
        todos.map((todo) => (todo.id === id ? updatedTodo : todo)),
      );
    } catch (error) {
      console.error(error);
      alert("Todoの更新に失敗しました");
    }
  };

  // 「ごみ箱」を空にする
  const handleEmpty = async () => {
    const removedTodos = todos.filter((todo) => todo.removed);
    try {
      await Promise.all(removedTodos.map((todo) => deleteTodo(todo.id)));
      setTodos((todos) => todos.filter((todo) => !todo.removed));
    } catch (error) {
      console.error(error);
      alert("Todoの削除に失敗しました");
    }
  };

  // 「完了したタスク」をまとめて「ごみ箱」に移動する
  const handleMoveRemove = () => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.checked && !todo.removed ? { ...todo, removed: true } : todo,
      ),
    );
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "removed") return todo.removed;
    if (filter === "checked") return todo.checked && !todo.removed;
    return !todo.removed;
  });

  const filteredDeadline = (deadline: Deadline) => {
    return todos
      .filter((todo) => todo.deadline === deadline && !todo.removed)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  // デフォルトのsection
  const DEFAULT_SECTIONS: Section[] = [
    { id: "idea", deadline: "idea", title: "思いつき" },
    {
      id: "today",
      deadline: "today",
      title: "今日やる",
      note: <TodayNote loading={loading} message={message}/>,
    },
    { id: "tomorrow", deadline: "tomorrow", title: "明日やる" },
  ];

  const SECTIONS_BY_FILTER: Partial<Record<Filter, Section[]>> = {
    removed: [{ id: "removed", title: "ごみ箱", icon: "fa-solid fa-trash" }],
    checked: [
      { id: "checked", title: "完了したタスク", icon: "fa-solid fa-trophy" },
    ],
  };

  const sections: Section[] = SECTIONS_BY_FILTER[filter] ?? DEFAULT_SECTIONS;

  const filteredSections = (section: Section) => {
    if (section.deadline) {
      return filteredDeadline(section.deadline);
    }
    if (section.id === "removed" || section.id === "checked") {
      return filteredTodos;
    }

    return [];
  };

  // todoをドラッグで並び替える
  const handleDropOnItem = async (
    dragId: number,
    targetDeadline: Deadline,
    targetId?: number,
  ) => {
    // 配列をコピー
    const next = [...todos];

    // ドラッグしてるタスクの位置を取得
    const from = next.findIndex((todo) => todo.id === dragId);

    // タスクが見つからなければ終了
    if (from === -1) return;

    // ドロップ先が「今日やる」の場合
    // 上限チェック
    if (targetDeadline === "today") {
      const todayCount = todos.filter(
        (todo) =>
          todo.deadline === "today" && !todo.removed && todo.id !== dragId,
      ).length;

      // すでに3件あるならやめる
      if (todayCount >= 3) {
        setMessage("今日は既にやることがいっぱいです！💦");
        return;
      }
    }

    // メッセージを消す
    setMessage("");

    // ドラッグしているタスクを元の位置から削除
    const [moved] = next.splice(from, 1);
    // moved の deadline を移動先に書き換える
    const moved2 = { ...moved, deadline: targetDeadline };

    // 挿入先 index を決める
    let to: number;

    if (targetId != null) {
      // todoデータにドラッグ
      to = next.findIndex((todo) => todo.id === targetId);
      if (to === -1) return;
    } else {
      // セクションにドラッグ
      const lastIndex = [...next]
        .map((todo, index) => ({ todo, index }))
        .filter(({ todo }) => todo.deadline === targetDeadline)
        .pop()?.index;

      to = lastIndex == null ? next.length : lastIndex + 1;
    }

    // ドラッグ対象のデータを挿入
    next.splice(to, 0, moved2);

    // 先に画面を更新
    setTodos(next);

    // API保存用のpayloadを作成
    const payload = ["idea", "today", "tomorrow"].flatMap((deadline) =>
      next
        .filter((todo) => todo.deadline === deadline)
        .map((todo, index) => ({
          id: todo.id,
          deadline: todo.deadline,
          sortOrder: index,
        }))
    );

    // APIで保存
    try {
      await updateTodoOrder(payload);
    } catch (error) {
      console.error("並び順の保存に失敗しました", error);
    }
  };

  // async(関数が非同期処理を行うことを宣言)
  const load = useCallback(async () => {
    const start = Date.now();
    try {
      const data = (await fetchTodos()) as Todo[];
      setTodos(data);
    } catch (error) {
      console.error(error);
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(300 - elapsed, 0);

      setTimeout(() => {
        setLoading(false);
      }, delay);
    }
  }, []);

  // ロード
  useEffect(() => {
    let timer: number;

    const dateUpdate = () => {
      const diff = getRemainingTime();

      // ロードが終わり次第、24時にカウントダウンを更新
      timer = window.setTimeout(async () => {
        try {
          await load();
        } finally {
          dateUpdate();
        }
      }, 5000);
    };
    load();
    dateUpdate();

    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="app">
      <div className="app-header">
        <h1 className="app-title">タスク管理アプリ</h1>
        <div className="toolbar">
          <select
            name="filter"
            className="filter-select"
            defaultValue="all"
            onChange={(e) => handleFilter(e.target.value as Filter)}
          >
            <option value="all">すべてのタスク</option>
            <option value="checked">完了したタスク</option>
            <option value="removed">ごみ箱</option>
          </select>

          {filter === "removed" ? (
            <button
              className="removed-button"
              onClick={handleEmpty}
              disabled={todos.filter((todo) => todo.removed).length === 0}
            >
              ごみ箱を空にする
            </button>
          ) : filter === "checked" ? (
            <button
              className="checked-button"
              onClick={handleMoveRemove}
              disabled={todos.filter((todo) => todo.checked).length === 0}
            >
              すべてごみ箱に移動する
            </button>
          ) : (
            <Form
              text={text}
              time={time}
              errors={errors}
              onSubmit={handleSubmit}
              onChangeDeadline={handleDeadline}
              onChangeText={handleText}
              onChangeTime={handleTime}
              onBlur={onBlur}
            />
          )}
        </div>
      </div>

      <main className="board">
        {sections.map((section) => (
          <TodoSection
            key={section.id}
            section={section}
            draggingId={draggingId}
            setDraggingId={setDraggingId}
            filteredSections={filteredSections}
            onChange={handleTodo}
            varidateForm={varidateForm}
            onDropItem={handleDropOnItem}
            loading={loading}
          />
        ))}
      </main>
    </div>
  );
};

export default App;
