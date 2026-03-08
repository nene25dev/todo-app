import type {
    Errors,
    Deadline,
} from "../types";

type Props = {
    text: string
    time: string
    errors: Errors
    onChangeText: (text: string) => void
    onChangeTime: (time: string) => void
    onChangeDeadline: (deadline: Deadline) => void
    onSubmit: () => void
    onBlur: (field: keyof Errors) => void
};

export const Form = ({
    text,
    time,
    errors,
    onChangeText,
    onChangeTime,
    onChangeDeadline,
    onBlur,
    onSubmit,
}: Props) => {
    return (
        <form className="add-form"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
        >

            <select
                className="deadline-select"
                defaultValue="idea"
                onChange={(e) => onChangeDeadline(e.target.value as Deadline)}
            >
                <option value="idea">思いつき</option>
                <option value="today">今日やる</option>
                <option value="tomorrow">明日やる</option>
            </select>
            <div>
                <input className="todo-input"
                    type="text" value={text}
                    placeholder="タスクを入力してください"
                    onChange={(e) => onChangeText(e.target.value)}
                    onBlur={() => onBlur('text')} />
                {errors.text && <p className='form-error'>{errors.text}</p>}
            </div>
            <div>
                <input className="todo-input todo-time"
                    type="number"
                    placeholder="かかる時間"
                    value={time} onChange={(e) => onChangeTime(e.target.value)}
                    onBlur={() => onBlur('time')} /> <span className='small'>分</span>
                <p className='small'>※30分まで</p>
                {errors.time && <p className='form-error'>{errors.time}</p>}
            </div>

            <input className="add-button" type="submit" value="追加" />
        </form>
    );
}