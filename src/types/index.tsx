export type Task = {
  id: number;
  title: string;
  description?: string;
  columnId: number;
  order: number;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  assignee?: string;
  tags?: string[];
  completed?: boolean;
  ownerId?: number;
  currentUser?: { id: number };
};

export type Column = {
  id: number;
  name: string;
  taskIds: number[];
};

export type Board = {
  id: number;
  name: string;
  description?: string;
  columns: Column[];
  tasks: Task[];
  activities: Activity[];
};

export type CreateBoardInput = {
  name: string;
  description?: string;
};

export type Activity = {
  id: number;
  message: string;
  createdAt: string;
};