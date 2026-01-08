import { TodoItem } from "./TodoItem";
import type {
    Todo,
    Errors,
    Section,
    Deadline
} from "../types";

type Props = {
    section: Section;
    draggingId: number | null;
    setDraggingId: React.Dispatch<React.SetStateAction<number | null>>;
    filteredSections: (section: Section) => Todo[];
    onChange: (id: number, updates: Partial<Todo>) => void;
    varidateForm: (values: { text: string; time: string | number }) => Errors;
    onDropItem: (dragId: number, targetDeadline: Deadline, targetId?: number,) => void;
};

export const TodoSection = ({ section, draggingId, setDraggingId, filteredSections, onChange, varidateForm, onDropItem }: Props) => {

    return (
        <section className='box' onDragOver={(e) => e.preventDefault()} onDrop={() => {
            if (draggingId == null) return;
            if (!section.deadline) return;
            onDropItem(draggingId, section.deadline);
            setDraggingId(null);
        }}>
            <h2>{section.title}{section.icon && <i className={`${section.icon}`}></i>}</h2>
            {section.note}
            <ul>{filteredSections(section).map((todo) => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    setDraggingId={setDraggingId}
                    onChange={onChange}
                    varidateForm={varidateForm}
                    onDropOnItem={() => {
                        if (draggingId == null) return;
                        onDropItem(draggingId, todo.deadline, todo.id);
                        setDraggingId(null);
                    }}
                />
            ))}</ul>
        </section>
    );
}