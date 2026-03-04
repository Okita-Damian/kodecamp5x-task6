"use client";

import { useEffect, useRef } from "react";
import { Message } from "../types/message";
import ChatMessage from "./ChatMessage";

export default function ChatWindow({ messages }: { messages: Message[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, index) => (
        <ChatMessage key={index} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
