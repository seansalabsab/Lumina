
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";

const AppHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="flex w-full border-b bg-white px-4 py-2">
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
