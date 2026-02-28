import { Droppable, Draggable } from "@hello-pangea/dnd";
import type { Column as ColumnType, Task, Board } from "../types/index.js";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  board: Board;
  column: ColumnType;
  openTaskModal: Dispatch<SetStateAction<Task | null>>;
  openNewTaskModal?: (columnId: number) => void;
  deleteTask?: (taskId: number) => void;
};

export default function Column({
  board,
  column,
  openTaskModal,
  openNewTaskModal,
  deleteTask,
}: Props) {
  const tasks = column.taskIds
    .map(id => board.tasks.find(t => t.id === id))
    .filter((t): t is Task => t !== undefined);

  return (
    <div className="w-64 bg-gray-100 rounded p-2 shrink-0">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold">{column.name}</h2>
        {openNewTaskModal && (
          <button
            onClick={() => openNewTaskModal(column.id)}
            className="text-sm px-2 py-1 bg-green-500 text-white rounded"
          >
            + Add Task
          </button>
        )}
      </div>

      <Droppable droppableId={column.id.toString()}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-50 p-1 rounded ${
              snapshot.isDraggingOver ? "bg-blue-100" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <Draggable
                key={task.id}
                draggableId={task.id.toString()}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`p-2 mb-2 rounded shadow border bg-white relative ${
                      snapshot.isDragging ? "bg-blue-200" : ""
                    }`}
                  >
                    <h3 className="font-semibold">{task.title}</h3>
                    {task.description && (
                      <p style={{ fontSize: 12 }}>{task.description}</p>
                    )}
                    {task.priority && (
                      <span
                        className={`text-xs px-1 rounded ${
                          task.priority === "high"
                            ? "bg-red-400 text-white"
                            : task.priority === "medium"
                            ? "bg-yellow-300"
                            : "bg-green-300"
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}

                    {deleteTask && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          deleteTask(task.id!);
                        }}
                        className="absolute z-10 top-1 right-1 text-white bg-red-600 text-sm hover:bg-red-800 p-1 rounded-sm"
                      >
                        Delete
                      </button>
                    )}

                    <div
                      onClick={() => openTaskModal(task)}
                      className="absolute inset-0"
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}