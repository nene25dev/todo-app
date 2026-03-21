export const TodoSkeleton = () => {
    return (
        <ul className="todo-list">
            {[...Array(3)].map((_, i) => (
                <li key={i} className="todo-item --skeleton">
                     <span className="skeleton-checkbox"></span>

                    <p className="todo-item__text">
                        <span className="skeleton-text"></span>
                    </p>

                    <p className="todo-item__time">
                        <span className="todo-item__time-row">
                            <span className="skeleton-time"></span>
                        </span>
                    </p>

                    <button className="skeleton-button"></button>
                </li>
            ))}
        </ul>
    );
}