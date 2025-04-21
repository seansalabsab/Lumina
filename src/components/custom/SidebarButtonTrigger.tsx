import { useSidebar } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import IconButton from "./IconButton";

const SidebarButtonTrigger = () => {
  const {open, setOpen} = useSidebar()
  return (
    <IconButton onClick={() => setOpen(!open)}>
    {open ? (
      <ChevronLeft className="text-gray-500" />
    ):(
      <ChevronRight className="text-gray-500" />
    )}
    </IconButton>
  )
  
}

export default SidebarButtonTrigger;
