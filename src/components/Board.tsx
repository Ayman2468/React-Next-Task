import { useBoard } from "@/hooks/useBoard.js";

type Props = { boardId: number };
export default function Board({ boardId }: Props) {
  const { data: board } = useBoard(boardId);
  return (
    <div>
      {board?.tasks.map(t => (
        <label key={t.id}>
          <input type="checkbox" checked={t.completed} readOnly />
          {t.title}
        </label>
      ))}
    </div>
  );
}