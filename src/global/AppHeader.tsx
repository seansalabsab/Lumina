
import { useLocation, useNavigate } from "react-router-dom";
import { useChat } from "@/context/ChatContext";
import { useCompletion } from "@/context/CompletionContext";
import { ROUTES } from "@/constants";
import SidebarButtonTrigger from "@/components/custom/SidebarButtonTrigger";
import { useSidebar } from "@/components/ui/sidebar";
const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {open} = useSidebar()

  const isActive = (path: string) => location.pathname.startsWith(path);
  const isChat = location.pathname.startsWith("/chat")
  const {currentConversation} = isChat ? useChat() : useCompletion()

  return (
    <header className="flex w-full bg-background border-b px-4 py-2 justify-between items-center">
      {!open && <SidebarButtonTrigger />}
      <h1 className="font-semibold">{currentConversation?.title}</h1>
      {ROUTES.map((tab) => (
        <button
          key={tab.path}
          onClick={() => navigate(tab.path)}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            isActive(tab.path)
              ? "border-cyan-500 text-cyan-600"
              : "border-transparent text-gray-500 hover:text-cyan-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </header>
  );
};

export default AppHeader;
