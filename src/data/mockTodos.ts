import type { Todo } from "../types";

export const mockTodos: Todo[] = [
    {
    id: 1,
    value: 'メールをまとめて返信する',
    checked: false,
    removed: false,
    deadline: 'today',
    time: 20,
},
    {
    id: 2,
    value: 'リビングを片付ける',
    checked: false,
    removed: true,
    deadline: 'tomorrow',
    time: 30,
},
    {
    id: 3,
    value: 'テストデータ追加',
    checked: true,
    removed: false,
    deadline: 'today',
    time: 20,
},
    {
    id: 4,
    value: 'ReactのuseEffectを復習する',
    checked: false,
    removed: false,
    deadline: 'idea',
    time: 30,
},
    {
    id: 5,
    value: 'スマホ表示を確認',
    checked: false,
    removed: false,
    deadline: 'tomorrow',
    time: 10,
},
];