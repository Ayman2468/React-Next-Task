import { jsx as _jsx } from "react/jsx-runtime";
export default function Skeleton({ className }) {
    return _jsx("div", { className: `animate-pulse bg-gray-300 rounded ${className}` });
}
