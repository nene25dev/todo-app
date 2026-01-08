import localforage from 'localforage';
import { useEffect, useState } from 'react';
import { isTodos } from './lib/isTodo';
import { Form } from './components/Form';
import './App.css'
import { TodoSection } from './components/TodoSection';
import { mockTodos } from './data/mockTodos';
import type {
  Todo,
  Errors,
  Filter,
  Deadline,
  Section
} from "./types";

const App = () => {
  const [text, setText] = useState('');
  const [time, setTime] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [deadline, setDeadline] = useState<Deadline>('idea');
  const [errors, setErrors] = useState<Errors>({});
  const [draggingId, setDraggingId] = useState<number | null>(null);


  // バリデーション関数
  const varidateText = (text: string) => {
    // タスクが未入力だった場合
    if (!text.trim()) {
      return "文字を入力してください。";
    }
    return "";
  }
  const varidateTime = (time: string | number) => {
    const num = Number(time);
    // かかる時間 が空もしくは30より大きい場合
    if (isNaN(num) || num <= 0) {
      return "値を入力してください。";
    } else if (num > 30) {
      return "30分以内の値で入力してください。";
    }
    return "";
  }

  const varidateForm = (values: { text: string; time: string | number }) => {
    return {
      text: varidateText(values.text),
      time: varidateTime(values.time),
    };
  }

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


  const handleSubmit = () => {
    // バリデーション結果を受け取る
    const result = varidateForm({ text, time });
    // エラーを表示
    setErrors(result);

    // どれか1つでもエラーメッセージがあれば中断
    const hasError = Object.values(result).some((msg) => msg && msg.length > 0);
    if (hasError) return;

    const num = Number(time);

    // 「今日やる」追加上限を設定
    if (deadline === 'today') {
      const todayCount = todos.filter(
        (todo) => todo.deadline === 'today' && !todo.removed
      ).length;

      if (todayCount >= 3) {
        alert('今日は既にやることがいっぱいです！💦');
        return;
      }
    }
    const newTodo: Todo = {
      id: new Date().getTime(),
      value: text,
      checked: false,
      removed: false,
      deadline: deadline,
      time: num,
    };

    setTodos((todos) => [newTodo, ...todos]);
    setText('');
  };

  const handleFilter = (filter: Filter) => {
    setFilter(filter);
  };
  const handleDeadline = (deadline: Deadline) => {
    setDeadline(deadline);
  };

  // 特定のタスクのプロパティを差し替え
  const handleTodo = (id: number, updates: Partial<Todo>) => {
    setTodos((todos) =>
      todos.map((todo) =>
        todo.id === id ? { ...todo, ...updates } : todo
      )
    );
  };

  // 「ごみ箱」を空にする
  const handleEmpty = () => {
    setTodos((todos) => todos.filter((todo) => !todo.removed));
  };

  // 「完了したタスク」をまとめて「ごみ箱」に移動する
  const handleMoveRemove = () => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.checked && !todo.removed
          ? { ...todo, removed: true }
          : todo
      )
    );
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'removed') return todo.removed;
    if (filter === 'checked') return todo.checked && !todo.removed;
    return !todo.removed;
  });

  const filteredDeadline = (deadline: Deadline) => {
    return todos.filter((todo) => todo.deadline === deadline && !todo.removed);
  }

  const DEFAULT_SECTIONS: Section[] = [
    { id: 'idea', deadline: 'idea', title: '思いつき' },
    {
      id: 'today',
      deadline: 'today',
      title: '今日やる',
      note: (
        <>
          <p className="text">明日まで残り： <Countdown /></p>
          <p className="text">※3件まで</p>
        </>
      ),
    },
    { id: 'tomorrow', deadline: 'tomorrow', title: '明日やる' },
  ];


  const SECTIONS_BY_FILTER: Partial<Record<Filter, Section[]>> = {
    removed: [{ id: 'removed', title: 'ごみ箱', icon: 'fa-solid fa-trash' }],
    checked: [{ id: 'checked', title: '完了したタスク', icon: 'fa-solid fa-trophy' }],
  };

  const sections: Section[] = SECTIONS_BY_FILTER[filter] ?? DEFAULT_SECTIONS;

  const filteredSections = (section: Section) => {
    if (section.deadline) {
      return filteredDeadline(section.deadline);
    }
    if (section.id === 'removed' || section.id === 'checked') {
      return filteredTodos;
    }

    return [];
  }

  // todoをドラッグで並び替える
  const handleDropOnItem = (dragId: number, targetDeadline: Deadline, targetId?: number) => {
    setTodos((prev) => {
      const next = [...prev];

      // データの位置を取得
      const from = next.findIndex((todo) => todo.id === dragId);

      // 見つからなければ元のデータを返す
      if (from === -1) return prev;

      // ドロップ先が「今日やる」の場合
      // 上限チェック
      if (targetDeadline === "today") {
        const todayCount = todos.filter(
          (todo) =>
            todo.deadline === 'today' &&
            !todo.removed &&
            todo.id !== draggingId // ドラッグ中のデータは除外
        ).length;
        if (todayCount >= 3) {
          alert("今日は既にやることがいっぱいです！💦");
          return prev;
        }
      }

      // ドラッグ対象のデータを削除
      const [moved] = next.splice(from, 1);
      const moved2 = { ...moved, deadline: targetDeadline };


      // 挿入先 index を決める
      let to: number;

      if (targetId != null) {
        // todoデータにドラッグ
        to = next.findIndex((todo) => todo.id === targetId);
        if (to === -1) return prev;
      } else {
        // セクションにドラッグ
        const lastIndex = [...next]
          .map((todo, id) => ({ todo, id }))
          .filter(({ todo }) => todo.deadline === targetDeadline)
          .pop()?.id;

        to = lastIndex == null ? next.length : lastIndex + 1;
      }

      // ドラッグ対象のデータをドラッグが重なっている対象の位置に挿入
      next.splice(to, 0, moved2);

      return next;
    });
  };


  // カウントダウン
  function Countdown() {
    const [countdown, setCountdown] = useState("");

    useEffect(() => {
      const update = () => {
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const diff = tomorrow.getTime() - now.getTime();

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown(`${hours}時間 ${minutes}分 ${seconds}秒`);
      };

      update(); // 初回実行
      const timer = setInterval(update, 1000);

      return () => clearInterval(timer);
    }, []);

    return <>{countdown}</>;
  }

  // 現在時刻 (YYYY-MM-DD)を取得
  const DAY_KEY_STORAGE = "dayKey_lastChecked";
  const getDayKey = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // 日付が変更したら 明日やる を 今日やる に移動
  const rolloverTodosIfNewDay = (todos: Todo[], now = new Date()) => {
    const todayKey = getDayKey(now);
    const lastKey = localStorage.getItem(DAY_KEY_STORAGE);

    // 初回 or 同一日なら何もしない
    if (!lastKey || lastKey === todayKey) {
      localStorage.setItem(DAY_KEY_STORAGE, todayKey);
      return todos;
    }

    // 今日やるの件数を数える
    const todayCount = todos.filter((todo) => todo.deadline === "today" && !todo.removed).length;


    // 日付が変わった：tomorrow -> today
    const next: Todo[] = todos.map((todo) => {
      if (todo.deadline === "tomorrow" && todayCount < 3) {
        return { ...todo, deadline: "today" as Todo["deadline"] }
      }
      return todo;
    });

    localStorage.setItem(DAY_KEY_STORAGE, todayKey);
    return next;
  };


  // データを取得
  useEffect(() => {
    localforage
      .getItem('todo-app')
      // value: 保存されている値
      .then((values) => {
        if (isTodos(values)) {
          // 保存されているタスクを読み込む
          // そのまま「明日やる → 今日やる」に変換
          const rolled = rolloverTodosIfNewDay(values);
          setTodos(rolled);
        }
      });
  }, [])

  // データ (=value) を保存
  useEffect(() => {
    localforage.setItem('todo-app', todos);
  }, [todos]);

  // アプリを開いてる間に「明日やる → 今日やる」に変換
  useEffect(() => {
    const timer = setInterval(() => {
      setTodos((prev) => rolloverTodosIfNewDay(prev));
    }, 60 * 1000); // 1分ごとにチェック

    return () => clearInterval(timer); // アンマウント時に止める
  }, []);

  // 初期化時のみテストデータ追加
  useEffect(() => {
    const init = async () => {
      const saved = await localforage.getItem<Todo[]>('todos');
      if (!saved || saved.length === 0) {
        setTodos(mockTodos);
        await localforage.setItem('todos', mockTodos);
      }
    };
    init();
  }, []);



  return (
    <div className="app">
      <div className='app-header'>
        <h1 className="app-title">タスク管理アプリ</h1>
        <div className='toolbar'>
          <select name='filter'
            className="filter-select"
            defaultValue="all"
            onChange={(e) => handleFilter(e.target.value as Filter)}
          >
            <option value="all">すべてのタスク</option>
            <option value="checked">完了したタスク</option>
            <option value="removed">ごみ箱</option>
          </select>

          {filter === 'removed' ? (
            <button
              className='removed-button'
              onClick={handleEmpty}
              disabled={todos.filter((todo) => todo.removed).length === 0}
            >
              ごみ箱を空にする
            </button>
          ) : filter === 'checked' ? (
            <button
              className='checked-button'
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

      <main className='board'>
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
          />
        ))}

      </main>
    </div>
  );
};

export default App