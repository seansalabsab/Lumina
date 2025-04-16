
import { Link } from "react-router-dom";
import { XIcon } from "lucide-react";
import { Conversation } from "@/api/types";
import { Button } from "../ui/button";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";

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
    c.title.length > 26 ? c.title.slice(0, 23) + "..." : c.title;

  return (
    <SidebarMenuItem key={c.id}>
      <SidebarMenuButton className={`justify-between ${isActive ? "bg-cyan-100 text-cyan-900 font-semibold" :"hover:bg-muted"}`}>
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
          className="h-7 w-7 opacity-0 group-hover/menu-item:opacity-100"
          onClick={() => onDelete(c.id)}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </SidebarMenuButton>
    </SidebarMenuItem>

  )
};

export default SidebarConversationItem;
