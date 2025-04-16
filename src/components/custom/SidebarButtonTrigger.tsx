import { useSidebar } from "@/components/ui/sidebar";
import { MenuSquareIcon } from "lucide-react";
import IconButton from "./IconButton";

const SidebarButtonTrigger = () => {
  const {open, setOpen} = useSidebar()
  return (
    <IconButton onClick={() => setOpen(!open)}>
      <MenuSquareIcon />
    </IconButton>
  )
  
}

export default SidebarButtonTrigger;
