"use client";

import { useState } from "react";
import { Message } from "../types/message";
import ChatWindow from "../components/ChatHistory";
import ChatInput from "../components/ChatInput";
export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL;
  console.log("Agent_url:", AGENT_URL);

  const handleSend = async (text: string) => {
    const userMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setLoading(true);
    setError(null);

    console.log("Sending request:", updatedMessages);

    try {
      const response = await fetch(AGENT_URL as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error("Agent request failed");
      if (!response.body) throw new Error("No response body");

      // Add placeholder for assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let partial = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");

        // keep last partial line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.replace(/^data:\s*/, "").trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);
            console.log("Agent response:", data);

            // Only extract text from content_block_delta events
            if (data.type === "content_block_delta") {
              const deltaText = data.delta?.text;

              //  Only append if there is actual text
              if (deltaText) {
                partial += deltaText;

                setMessages((prev) => {
                  const last = prev[prev.length - 1];

                  if (last?.role === "assistant") {
                    return [
                      ...prev.slice(0, -1),
                      { ...last, content: partial },
                    ];
                  }

                  return prev;
                });
              }
            }
          } catch {
            // ignore incomplete JSON chunks
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto border">
      <div className="p-4 border-b font-bold text-lg">AI Chatbot</div>

      <ChatWindow messages={messages} />

      {error && <div className="text-red-500 p-2">{error}</div>}

      <ChatInput onSend={handleSend} disabled={loading} />
    </main>
  );
}
