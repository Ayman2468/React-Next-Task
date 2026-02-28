/* ---------------------------
   Load initial boards from JSON
---------------------------- */
import initialBoards from "../data/boards.json";

const STORAGE_KEY = "kanban_boards";

/* ---------------------------
   Default Columns
---------------------------- */
const defaultColumns = [
  { id: 1, name: "Todo", taskIds: [] },
  { id: 2, name: "In Progress", taskIds: [] },
  { id: 3, name: "Done", taskIds: [] },
];

/* ---------------------------
   Helpers
---------------------------- */
function loadBoards() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  // Fallback to JSON file data
  return JSON.parse(JSON.stringify(initialBoards));
}

function saveBoards(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let boardsDB = loadBoards();

/* ---------------------------
   Boards API
---------------------------- */
export const getBoards = async (page, perPage) => {
  await new Promise((r) => setTimeout(r, 200));
  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    data: boardsDB.slice(start, end),
    total: boardsDB.length,
  };
};

export const getBoard = async (boardId) => {
  const board = boardsDB.find((b) => b.id === Number(boardId));
  if (!board) throw new Error("Board not found");
  return JSON.parse(JSON.stringify(board));
};

export const createBoard = async (board) => {
  const newBoard = {
    id: Date.now(),
    name: board.name,
    description: board.description,
    columns: defaultColumns.map((c) => ({ ...c })), // initialize columns
    tasks: [],
    activities: [],
  };

  boardsDB.push(newBoard);
  saveBoards(boardsDB);

  return newBoard;
};

export const updateBoard = async (id, data) => {
  const idx = boardsDB.findIndex((b) => b.id === Number(id));
  if (idx === -1) throw new Error("Board not found");

  boardsDB[idx] = { ...boardsDB[idx], ...data };
  saveBoards(boardsDB);

  return boardsDB[idx];
};

export const deleteBoard = async (id) => {
  boardsDB = boardsDB.filter((b) => b.id !== Number(id));
  saveBoards(boardsDB);
};

/* ---------------------------
   Tasks API
---------------------------- */
export const createTask = async (boardId, data) => {
  const board = boardsDB.find((b) => b.id === Number(boardId));
  if (!board) throw new Error("Board not found");

  const newTask = { id: Date.now(), ...data };
  board.tasks.push(newTask);

  const column = board.columns.find((c) => c.id === newTask.columnId);
  if (column) column.taskIds.push(newTask.id);

  saveBoards(boardsDB);

  return newTask;
};

export const updateTask = async (boardId, taskId, data) => {
  const board = boardsDB.find((b) => b.id === Number(boardId));
  if (!board) throw new Error("Board not found");

  const taskIndex = board.tasks.findIndex((t) => t.id === Number(taskId));
  if (taskIndex === -1) throw new Error("Task not found");

  const oldTask = board.tasks[taskIndex];
  const updatedTask = { ...oldTask, ...data };
  board.tasks[taskIndex] = updatedTask;

  // Column change
  if (data.columnId !== undefined && data.columnId !== oldTask.columnId) {
    const oldColumn = board.columns.find((c) => c.id === oldTask.columnId);
    const newColumn = board.columns.find((c) => c.id === data.columnId);

    if (oldColumn)
      oldColumn.taskIds = oldColumn.taskIds.filter((id) => id !== Number(taskId));
    if (newColumn) newColumn.taskIds.push(Number(taskId));
  }

  // Order change
  if (data.order !== undefined) {
    const column = board.columns.find((c) => c.id === updatedTask.columnId);
    if (column) {
      column.taskIds = column.taskIds.filter((id) => id !== Number(taskId));
      column.taskIds.splice(updatedTask.order, 0, Number(taskId));
    }
  }

  saveBoards(boardsDB);
  return updatedTask;
};

export const deleteTask = async (boardId, taskId) => {
  const board = boardsDB.find((b) => b.id === Number(boardId));
  if (!board) throw new Error("Board not found");

  board.tasks = board.tasks.filter((t) => t.id !== Number(taskId));
  board.columns.forEach((col) => {
    col.taskIds = col.taskIds.filter((id) => id !== Number(taskId));
  });

  saveBoards(boardsDB);
};

export const addActivity = async (boardId, message) => {
  const board = boardsDB.find((b) => b.id === Number(boardId));
  if (!board) throw new Error("Board not found");

  const newActivity = { id: Date.now(), message, createdAt: new Date().toISOString() };
  board.activities.push(newActivity);

  saveBoards(boardsDB);

  return newActivity;
};