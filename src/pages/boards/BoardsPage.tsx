import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBoards } from "../../hooks/useBoards";
import Skeleton from "../../components/Skeleton";
import BoardFormModal from "../../components/BoardFormModal";
import { getPrompts, executePrompt } from "../../api/ai";

export default function BoardsPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const perPage = 5;
  const [modalData, setModalData] = useState<null | { name: string; description?: string; id?: number }>(null);

  // AI prompts
  const [prompts, setPrompts] = useState<{ name: string; content: string }[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, create, update, remove } = useBoards(page, perPage);

  const boards = data?.data ?? [];
  const total = data?.total ?? 0;

  // Load AI prompts from public/project-prompts
  useEffect(() => {
    getPrompts()
      .then(async (files: string[]) => {
        const promptsWithContent = await Promise.all(
          files.map(async (file) => {
            const res = await fetch(`/project-prompts/${file}`);
            const content = await res.text();
            return { name: file.replace(/\.md$/, ""), content };
          })
        );
        setPrompts(promptsWithContent);
        console.log(promptsWithContent);
      })
      .catch(err => console.error(err));
  }, []);

  // Execute AI and create board automatically
  const handleExecute = async () => {
    if (!selectedPrompt) return;
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
          create.mutate(
            { name: json.name, description: json.description || "" },
            {
              onSuccess: () => {
                alert(`Board "${json.name}" created successfully!`);
                setPage(1); // go to first page so new board shows
              },
            }
          );
        }
      } catch {
        console.log("AI output not JSON, skipping auto-create");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to execute prompt");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Boards Management</h1>

      {/* AI Prompt Section */}
      <div className="mb-4 p-4 border rounded">
        <h2 className="font-bold mb-2">AI Prompts</h2>
        <select
          className="w-full p-2 border rounded mb-2"
          value={selectedPrompt}
          onChange={(e) => setSelectedPrompt(e.target.value)}
        >
          <option value="">-- Select a prompt --</option>
          {prompts.map((p, i) => (
            <option key={p.name + i} value={p.content}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleExecute}
          disabled={loading || !selectedPrompt}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? "Running..." : "Run Prompt"}
        </button>
        {error && <div className="text-red-600 mt-2">{error}</div>}
        {aiResult && (
          <div className="mt-2 p-2 bg-gray-100 border rounded">
            <strong>AI Result:</strong>
            <pre className="whitespace-pre-wrap">{aiResult}</pre>
          </div>
        )}
      </div>

      {/* Add Board Button */}
      <button
        onClick={() => setModalData({ name: "" })}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add Board
      </button>

      {/* Boards List */}
      {isLoading ? (
        Array.from({ length: perPage }).map((_, i) => <Skeleton key={i} className="h-10 mb-2 rounded" />)
      ) : (
        <>
          {boards.length === 0 ? (
            <p className="text-gray-500">No boards added yet.</p>
          ) : (
            <ul className="space-y-2">
              {boards.map((b) => (
                <li
                  key={b.id}
                  className="flex justify-between items-center p-3 border rounded hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => navigate(`/boards/${b.id}`)}
                >
                  <span className="font-medium">{b.name}</span>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setModalData(b)} className="px-3 py-1 bg-yellow-400 rounded text-sm">
                      Edit
                    </button>
                    <button onClick={() => remove.mutate(b.id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination */}
          {total > perPage && (
            <div className="mt-6 flex gap-2">
              {Array.from({ length: Math.ceil(total / perPage) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 border rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Board Modal */}
      {modalData && (
        <BoardFormModal
          defaultValues={modalData}
          onSubmit={(form) => {
            if (modalData.id) {
              update.mutate({ id: modalData.id, data: form });
            } else {
              create.mutate(form);
            }
            setModalData(null);
          }}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
}