// src/app/page.js
import Chatbot from "@/components/ChatBot";

export default async function Home() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <Chatbot />
    </div>
  );
}
