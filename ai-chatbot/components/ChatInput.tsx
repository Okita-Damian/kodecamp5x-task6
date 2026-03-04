"use client";

import { useState } from "react";

export default function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    onSend(input);
    setInput("");
  };

  return (
    <div className="flex gap-2 p-4 border-t">
      <input
        className="flex-1 border rounded p-2"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
      />

      <button
        onClick={handleSend}
        disabled={disabled}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </div>
  );
}
