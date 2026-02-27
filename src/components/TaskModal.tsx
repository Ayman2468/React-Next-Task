import { useState } from "react";
import type { Task } from "../types";

type Props = {
  isOpen?: boolean;
  task: { 
    id?: number; 
    title: string; 
    description?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
    assignee?: string;
    ownerId?: number;
  };
  currentUser?: { id: number }; // make required for clarity
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => void;
};

export default function TaskModal({
  task,
  onClose,
  onSubmit,
  currentUser,
}: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority || "low");
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [assignee, setAssignee] = useState(task.assignee || "");

  //for test only      const isOwner = task.ownerId === currentUser.id;
  const isOwner = 1;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-96">
        <h2 className="text-lg font-bold mb-2">{task.id ? "Edit Task" : "New Task"}</h2>

        <input
          type="text"
          className="border p-2 w-full mb-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          disabled={!isOwner} // ← disable for non-owner
        />

        <textarea
          className="border p-2 w-full mb-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description"
          disabled={!isOwner} // ← disable for non-owner
        />

        <label className="block mb-2">
          Priority:
          <select
            className="border p-2 w-full mt-1"
            value={priority}
            onChange={e => setPriority(e.target.value as "low" | "medium" | "high")}
            disabled={!isOwner} // ← disable for non-owner
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="block mb-2">
          Due Date:
          <input
            type="date"
            className="border p-2 w-full mt-1"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            disabled={!isOwner} // ← disable for non-owner
          />
        </label>

        <input
          type="text"
          className="border p-2 w-full mb-2"
          value={assignee}
          onChange={e => setAssignee(e.target.value)}
          placeholder="Assignee"
          disabled={!isOwner} // ← disable for non-owner
        />

        <div className="flex justify-end gap-2 mt-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => onSubmit({ title, description, priority, dueDate, assignee })}
            disabled={!isOwner}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}