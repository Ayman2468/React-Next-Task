import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBoards } from "../../hooks/useBoards.js";
import Skeleton from "../../components/Skeleton.js";
import BoardFormModal from "../../components/BoardFormModal.js";
import { getPrompts, executePrompt } from "../../api/ai.js";
export default function BoardsPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const perPage = 5;
    const [modalData, setModalData] = useState(null);
    // AI prompts
    const [prompts, setPrompts] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState("");
    const [aiResult, setAiResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { data, isLoading, create, update, remove } = useBoards(page, perPage);
    const boards = data?.data ?? [];
    const total = data?.total ?? 0;
    // Load AI prompts from public/project-prompts
    useEffect(() => {
        getPrompts()
            .then(async (files) => {
            const promptsWithContent = await Promise.all(files.map(async (file) => {
                const res = await fetch(`/project-prompts/${file}`);
                const content = await res.text();
                return { name: file.replace(/\.md$/, ""), content };
            }));
            setPrompts(promptsWithContent);
        })
            .catch(err => console.error(err));
    }, []);
    // Execute AI and create board automatically
    const handleExecute = async () => {
        if (!selectedPrompt)
            return;
        setLoading(true);
        setError(null);
        try {
            const data = await executePrompt(selectedPrompt);
            const resultText = data.result || "";
            setAiResult(resultText);
            // Try parsing JSON returned by AI
            try {
                const json = JSON.parse(resultText);
                if (json.action === "createBoard" && json.name) {
                    create.mutate({ name: json.name, description: json.description || "" }, {
                        onSuccess: () => {
                            alert(`Board "${json.name}" created successfully!`);
                            setPage(1); // go to first page so new board shows
                        },
                    });
                }
            }
            catch {
                console.log("AI output not JSON, skipping auto-create");
            }
        }
        catch (err) {
            console.error(err);
            setError(err.message || "Failed to execute prompt");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Boards Management" }), _jsxs("div", { className: "mb-4 p-4 border rounded", children: [_jsx("h2", { className: "font-bold mb-2", children: "AI Prompts" }), _jsxs("select", { className: "w-full p-2 border rounded mb-2", value: selectedPrompt, onChange: (e) => setSelectedPrompt(e.target.value), children: [_jsx("option", { value: "", children: "-- Select a prompt --" }), prompts.map((p, i) => (_jsx("option", { value: p.content, children: p.name }, p.name + i)))] }), _jsx("button", { onClick: handleExecute, disabled: loading || !selectedPrompt, className: "px-4 py-2 bg-blue-500 text-white rounded", children: loading ? "Running..." : "Run Prompt" }), error && _jsx("div", { className: "text-red-600 mt-2", children: error }), aiResult && (_jsxs("div", { className: "mt-2 p-2 bg-gray-100 border rounded", children: [_jsx("strong", { children: "AI Result:" }), _jsx("pre", { className: "whitespace-pre-wrap", children: aiResult })] }))] }), _jsx("button", { onClick: () => setModalData({ name: "" }), className: "mb-4 px-4 py-2 bg-blue-600 text-white rounded", children: "Add Board" }), isLoading ? (Array.from({ length: perPage }).map((_, i) => _jsx(Skeleton, { className: "h-10 mb-2 rounded" }, i))) : (_jsxs(_Fragment, { children: [boards.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "No boards added yet." })) : (_jsx("ul", { className: "space-y-2", children: boards.map((b) => (_jsxs("li", { className: "flex justify-between items-center p-3 border rounded hover:bg-gray-100 transition cursor-pointer", onClick: () => navigate(`/boards/${b.id}`), children: [_jsx("span", { className: "font-medium", children: b.name }), _jsxs("div", { className: "flex gap-2", onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: () => setModalData(b), className: "px-3 py-1 bg-yellow-400 rounded text-sm", children: "Edit" }), _jsx("button", { onClick: () => remove.mutate(b.id), className: "px-3 py-1 bg-red-500 text-white rounded text-sm", children: "Delete" })] })] }, b.id))) })), total > perPage && (_jsx("div", { className: "mt-6 flex gap-2", children: Array.from({ length: Math.ceil(total / perPage) }).map((_, i) => (_jsx("button", { onClick: () => setPage(i + 1), className: `px-3 py-1 border rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white"}`, children: i + 1 }, i))) }))] })), modalData && (_jsx(BoardFormModal, { defaultValues: modalData, onSubmit: (form) => {
                    if (modalData.id) {
                        update.mutate({ id: modalData.id, data: form });
                    }
                    else {
                        create.mutate(form);
                    }
                    setModalData(null);
                }, onClose: () => setModalData(null) }))] }));
}
