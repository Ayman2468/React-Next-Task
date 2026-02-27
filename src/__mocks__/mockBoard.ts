export default {
  id: 1,
  name: "Test Board",
  columns: [
    { id: 1, name: "To Do", taskIds: [1] },
    { id: 2, name: "Done", taskIds: [] },
  ],
  tasks: [
    { id: 1, title: "Task 1", columnId: 1, order: 0, completed: false },
  ],
  activities: [],
};