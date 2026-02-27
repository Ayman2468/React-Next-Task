import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "../types/index.js";

type Props = {
  task: Task;
  index: number;
  openTaskModal: (task: Task) => void;
};

export default function TaskCard({ task, index, openTaskModal }: Props) {
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => openTaskModal(task)}
          className="bg-white p-2 rounded shadow cursor-pointer"
        >
          <p className="font-bold">{task.title}</p>
          {task.description && <p className="text-sm text-gray-500">{task.description}</p>}
        </div>
      )}
    </Draggable>
  );
}