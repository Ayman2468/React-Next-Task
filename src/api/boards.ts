import type { Board, CreateBoardInput, Task } from "../types/index.js";

let boardsDB: Board[] = [
  {
    id: 1,
    name: "Project 1",
    columns: [
      { id: 1, name: "Todo", taskIds: [1, 2] },
      { id: 2, name: "In Progress", taskIds: [] },
      { id: 3, name: "Done", taskIds: [] },
    ],
    tasks: [
      { id: 1, title: "Task 1", columnId: 1, order: 0 },
      { id: 2, title: "Task 2", columnId: 1, order: 1 },
    ],
    activities: [],
  },
  {
    id: 2,
    name: "Project 2",
    columns: [
      { id: 1, name: "Todo", taskIds: [1] },
      { id: 2, name: "In Progress", taskIds: [] },
      { id: 3, name: "Done", taskIds: [] },
    ],
    tasks: [
      { id: 3, title: "Task 1", columnId: 1, order: 0,description: 'hi' },
    ],
    activities: [],
  },
];

export const getBoards = async (
  page: number,
  perPage: number
): Promise<{ data: Board[]; total: number }> => {
  await new Promise(r => setTimeout(r, 300));
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return { data: boardsDB.slice(start, end), total: boardsDB.length };
};

export const getBoard = async (boardId: number): Promise<Board> => {
  const board = boardsDB.find((b) => b.id === boardId);
  if (!board) throw new Error("Failed to fetch board");

  await new Promise((r) => setTimeout(r, 200));
  return { ...board, tasks: [...board.tasks] };
};

export const createBoard = async (
  board: CreateBoardInput
): Promise<Board> => {
  await new Promise(r => setTimeout(r, 300));

  const newBoard: Board = {
    id: Date.now(),
    name: board.name,
    description: board.description,
    columns: [],
    tasks: [],
    activities: []
  };

  boardsDB.push(newBoard);
  return newBoard;
};

export const updateBoard = async (
  id: number,
  data: Partial<Board>
): Promise<Board> => {
  await new Promise(r => setTimeout(r, 300));
  const idx = boardsDB.findIndex(b => b.id === id);
  if (idx === -1) throw new Error("Board not found");
  boardsDB[idx] = { ...boardsDB[idx], ...data };
  return boardsDB[idx];
};

export const deleteBoard = async (id: number): Promise<void> => {
  await new Promise(r => setTimeout(r, 300));
  boardsDB = boardsDB.filter(b => b.id !== id);
};

export const createTask = async (boardId: number, data: Omit<Task, "id">): Promise<Task> => {
  const board = boardsDB.find(b => b.id === boardId);
  if (!board) throw new Error("Board not found");

  const newTask: Task = { id: Date.now(), ...data };

  board.tasks.push(newTask);

  const column = board.columns.find(c => c.id === newTask.columnId);
  if (column) {
    column.taskIds.push(newTask.id);
  }

  return newTask;
};

export const updateTask = async (
  boardId: number,
  taskId: number,
  data: Partial<Task>
): Promise<Task> => {
  const board = boardsDB.find(b => b.id === boardId);
  if (!board) throw new Error("Board not found");

  const taskIndex = board.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) throw new Error("Task not found");

  const oldTask = board.tasks[taskIndex];
  const updatedTask = { ...oldTask, ...data };
  board.tasks[taskIndex] = updatedTask;

  if (data.columnId !== undefined && data.columnId !== oldTask.columnId) {
    const oldColumn = board.columns.find(c => c.id === oldTask.columnId);
    const newColumn = board.columns.find(c => c.id === data.columnId);

    if (oldColumn) {
      oldColumn.taskIds = oldColumn.taskIds.filter(id => id !== taskId);
    }
    if (newColumn) {
      newColumn.taskIds.push(taskId);
    }
  }

  if (data.order !== undefined) {
    const column = board.columns.find(c => c.id === updatedTask.columnId);
    if (column) {
      column.taskIds = column.taskIds.filter(id => id !== taskId);
      column.taskIds.splice(updatedTask.order, 0, taskId);
    }
  }

  return updatedTask;
};

export const deleteTask = async (boardId: number, taskId: number): Promise<void> => {
  const board = boardsDB.find(b => b.id === boardId);
  if (!board) throw new Error("Board not found");

  board.tasks = board.tasks.filter(t => t.id !== taskId);

  board.columns.forEach(col => {
    col.taskIds = col.taskIds.filter(id => id !== taskId);
  });

  await new Promise(r => setTimeout(r, 200));
};

export const addActivity = async (
  boardId: number,
  message: string
) => {
  const board = boardsDB.find(b => b.id === boardId);
  if (!board) throw new Error("Board not found");

  const newActivity = {
    id: Date.now(),
    message,
    createdAt: new Date().toISOString(),
  };

  board.activities.push(newActivity);

  await new Promise(r => setTimeout(r, 200));

  return newActivity;
};