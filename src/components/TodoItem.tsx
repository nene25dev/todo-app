import { useState } from "react";
import type {
    Todo,
    Errors,
} from "../types";


// 親から渡される値
type Props = {
    todo: Todo;
    setDraggingId: React.Dispatch<React.SetStateAction<number | null>>;
    onChange: (id: number, updates: Partial<Todo>) => void;
    varidateForm: (values: { text: string; time: string | number }) => Errors;
    onDropOnItem: () => void;
}

export const TodoItem = ({ todo, setDraggingId, onChange, varidateForm, onDropOnItem }: Props) => {

    // チェックボックスのid
    const checkboxId = `todo-check-${todo.id}`;

    // 編集用の値
    const [editText, seteditText] = useState(todo.value);
    const [editTime, seteditTime] = useState(String(todo.time));
    const [editErrors, setEditErrors] = useState<Errors>({});

    const handleEditBlur = (field: keyof Errors) => {
        const values = { text: editText, time: editTime };
        // バリデーション結果を受け取る
        const result = varidateForm(values);
        // エラー表示を更新
        setEditErrors((prev) => ({
            ...prev,
            [field]: result[field],
        }));

        // どれか1つでもエラーメッセージがあれば更新しない
        const hasError = Object.values(result).some((msg) => msg && msg.length > 0);
        if (hasError) {
            seteditText(todo.value);
            seteditTime(String(todo.time));
            return;
        };

        // エラーなしのときだけ todo を更新する
        onChange(todo.id, {
            value: values.text,
            time: Number(values.time),
        });
    };

    return (
        <li className={`todo-item${todo.checked ? ' is-checked' : ''} ${todo.removed ? ' is-removed' : ''}`}
            draggable
            onDragStart={() => setDraggingId(todo.id)}
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDropOnItem();
            }}
        >
            <label>
                <input
                    className="visually-hidden"
                    type="checkbox"
                    disabled={todo.removed}
                    checked={todo.checked}
                    onChange={() =>
                        onChange(todo.id, { 'checked': !todo.checked })
                    }
                />
                <span></span>
            </label>
            <p>
                <input
                    type="text"
                    disabled={todo.checked || todo.removed}
                    placeholder="タスクを入力してください"
                    value={editText}
                    onChange={(e) => seteditText(e.target.value)}
                    onBlur={() => handleEditBlur('text')}
                />
                {editErrors.text && (
                    <span className="form-error">{editErrors.text}</span>
                )}
            </p>

            <p className="todo-item__time">
                <span className="todo-item__time-row">
                    <input
                        type="number"
                        disabled={todo.checked || todo.removed}
                        value={editTime ?? ""}
                        placeholder="かかる時間"
                        onChange={(e) => seteditTime(e.target.value)}
                        onBlur={() => handleEditBlur('time')}
                    />
                    分
                </span>
                {editErrors.time && (
                    <span className="form-error">{editErrors.time}</span>
                )}
            </p>

            <button
                onClick={() => {
                    if (todo.removed) {
                        onChange(todo.id, { 'deadline': 'idea', 'removed': !todo.removed })
                    } else {
                        onChange(todo.id, { 'removed': !todo.removed })
                    }
                }
                }
            >
                {todo.removed ? '復元' : '削除'}
            </button>
        </li>
    )
}
