import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useBoard } from "@/hooks/useBoard.js";
export default function Board({ boardId }) {
    const { data: board } = useBoard(boardId);
    return (_jsx("div", { children: board?.tasks.map(t => (_jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: t.completed, readOnly: true }), t.title] }, t.id))) }));
}
