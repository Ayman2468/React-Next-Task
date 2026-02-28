// src/api/boards.ts
import fs from "fs";
import path from "path";
import type { Board, CreateBoardInput, Task, Column, Activity } from "../types/index.js";

const filePath = path.resolve("src/data/boards.json");

/* ---------------------------
   Helpers
---------------------------- */

function loadBoards(): Board[] {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]");
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Board[];
}

function saveBoards(data: Board[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

let boardsDB: Board[] = loadBoards();

/* ---------------------------
   Default Columns
---------------------------- */

const defaultColumns: Column[] = [
  { id: 1, name: "Todo", taskIds: [] },
  { id: 2, name: "In Progress", taskIds: [] },
  { id: 3, name: "Done", taskIds: [] }
];

/* ---------------------------
   Boards
---------------------------- */

export const getBoards = async (page: number, perPage: number): Promise<{ data: Board[]; total: number }> => {
  await new Promise(r => setTimeout(r, 300));

  const start = (page - 1) * perPage;
  const end = start + perPage;

  return { data: boardsDB.slice(start, end), total: boardsDB.length };
};

export const getBoard = async (boardId: number): Promise<Board> => {
  const board = boardsDB.find(b => b.id === boardId);
  if (!board) throw new Error("Failed to fetch board");

  await new Promise(r => setTimeout(r, 200));

  return JSON.parse(JSON.stringify(board));
};

export const createBoard = async (board: CreateBoardInput): Promise<Board> => {
  await new Promise(r => setTimeout(r, 300));

  const newBoard: Board = {
    id: Date.now(),
    name: board.name,
    description: board.description,
    columns: defaultColumns.map(c => ({ ...c })), // copy default columns
    tasks: [],
    activities: []
  };

  boardsDB.push(newBoard);
  saveBoards(boardsDB);

  return newBoard;
};

export const updateBoard = async (id: number, data: Partial<Board>): Promise<Board> => {
  await new Promise(r => setTimeout(r, 300));

  const idx = boardsDB.findIndex(b => b.id === id);
  if (idx === -1) throw new Error("Board not found");

  boardsDB[idx] = { ...boardsDB[idx], ...data };
  saveBoards(boardsDB);

  return boardsDB[idx];
};

export const deleteBoard = async (id: number): Promise<void> => {
  await new Promise(r => setTimeout(r, 300));
  boardsDB = boardsDB.filter(b => b.id !== id);
  saveBoards(boardsDB);
};

/* ---------------------------
   Tasks
---------------------------- */

export const createTask = async (boardId: number, data: Omit<Task, "id">): Promise<Task> => {
  const board = boardsDB.find(b => b.id === boardId);
  if (!board) throw new Error("Board not found");

  const newTask: Task = { id: Date.now(), ...data };
  board.tasks.push(newTask);

  const column = board.columns.find(c => c.id === newTask.columnId);
  if (column) column.taskIds.push(newTask.id);

  saveBoards(boardsDB);
  return newTask;
};

export const updateTask = async (boardId: number, taskId: number, data: Partial<Task>): Promise<Task> => {
  const board = boardsDB.find(b => b.id === boardId);
  if (!board) throw new Error("Board not found");

  const taskIndex = board.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) throw new Error("Task not found");

  const oldTask = board.tasks[taskIndex];
  const updatedTask = { ...oldTask, ...data };
  board.tasks[taskIndex] = updatedTask;

  // Move task to different column
  if (data.columnId !== undefined && data.columnId !== oldTask.columnId) {
    const oldColumn = board.columns.find(c => c.id === oldTask.columnId);
    const newColumn = board.columns.find(c => c.id === data.columnId);

    if (oldColumn) oldColumn.taskIds = oldColumn.taskIds.filter(id => id !== taskId);
    if (newColumn) newColumn.taskIds.push(taskId);
  }

  // Update order in column
  if (data.order !== undefined) {
    const column = board.columns.find(c => c.id === updatedTask.columnId);
    if (column) {
      column.taskIds = column.taskIds.filter(id => id !== taskId);
      column.taskIds.splice(updatedTask.order, 0, taskId);
    }
  }

  saveBoards(boardsDB);
  return updatedTask;
};

export const deleteTask = async (boardId: number, taskId: number): Promise<void> => {
  const board = boardsDB.find(b => b.id === boardId);
  if (!board) throw new Error("Board not found");

  board.tasks = board.tasks.filter(t => t.id !== taskId);

  board.columns.forEach(col => {
    col.taskIds = col.taskIds.filter(id => id !== taskId);
  });

  saveBoards(boardsDB);
  await new Promise(r => setTimeout(r, 200));
};

/* ---------------------------
   Activities
---------------------------- */

export const addActivity = async (boardId: number, message: string): Promise<Activity> => {
  const board = boardsDB.find(b => b.id === boardId);
  if (!board) throw new Error("Board not found");

  const newActivity: Activity = {
    id: Date.now(),
    message,
    createdAt: new Date().toISOString()
  };

  board.activities.push(newActivity);
  saveBoards(boardsDB);

  await new Promise(r => setTimeout(r, 200));
  return newActivity;
};