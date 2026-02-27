export const getPrompts = async () => {
    const res = await fetch("http://localhost:4000/api/ai/prompts");
    if (!res.ok)
        throw new Error("Failed to fetch prompts");
    return res.json(); // [{name: string, content: string}]
};
export const executePrompt = async (prompt) => {
    const res = await fetch("http://localhost:4000/api/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });
    if (!res.ok)
        throw new Error("Failed to execute prompt");
    return res.json(); // { result: string }
};
