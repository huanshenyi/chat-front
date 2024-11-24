import ChatInterface from "@/components/ChatInterface";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <ChatInterface />
      </main>
    </div>
  );
}
