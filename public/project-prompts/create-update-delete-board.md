Create a new Kanban board with the following details:
Board name: Project X
Description: Board for tracking marketing tasks
columns: [
  { "id": 1, "name": "Todo", "taskIds": [] },
  { "id": 2, "name": "In Progress", "taskIds": [] },
  { "id": 3, "name": "Done", "taskIds": [] }
]

Output only JSON:
{
  "action": "createBoard",
  "name": "Project X",
  "description": "Board for tracking marketing tasks",
  "columns": [
      { "id": 1, "name": "Todo", "taskIds": [] },
      { "id": 2, "name": "In Progress", "taskIds": [] },
      { "id": 3, "name": "Done", "taskIds": [] }
    ],
  "tasks": [

  ],
  "activities": []
}