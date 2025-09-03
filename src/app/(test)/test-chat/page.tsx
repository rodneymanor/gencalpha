"use client";

// import ChatInterface from "@/components/ChatInterface";

export default function TestChatPage() {
  const handleSubmit = (message: string, timeLimit: string) => {
    console.log("Message submitted:", message);
    console.log("Time limit:", timeLimit);
  };

  return (
    <div className="p-8">
      <h1>Test Chat Page</h1>
      <p>Chat interface temporarily disabled for deployment.</p>
      {/* <ChatInterface userName="Test User" heroText="Ready to test the new chat interface?" onSubmit={handleSubmit} /> */}
    </div>
  );
}
