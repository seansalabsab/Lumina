
import { Link } from "react-router-dom";
import { XIcon } from "lucide-react";
import { Conversation } from "@/api/types";
import { Button } from "../ui/button";
import { SidebarMenuItem } from "../ui/sidebar";

type SidebarConversationItemProps = {
  c: Conversation;
  root: string;
  isActive: boolean;
  onDelete: (id: string) => void;
};

const SidebarConversationItem = ({
  root,
  c,
  isActive,
  onDelete,
}: SidebarConversationItemProps) => {
  const croppedTitle =
    c.title.length > 30 ? c.title.slice(0, 29) + "..." : c.title;

  return (
    <SidebarMenuItem key={c.id}>
      <div className={`flex p-2 text-xs rounded-md items-center justify-between ${isActive ? "bg-cyan-100 text-cyan-900 font-semibold" :"hover:bg-muted"}`}>
        <Link 
          to={`${root}/${c.id}`} 
          className="flex flex-col items-start text-nowrap"
          title={c.title}
        >
          <span>{croppedTitle}</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-2 opacity-0 group-hover/menu-item:opacity-100 mr-1"
          onClick={() => onDelete(c.id)}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </SidebarMenuItem>

  )
};

export default SidebarConversationItem;
