
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Conversation } from "@/api/types";
import { useChat } from "@/context/ChatContext";
import { useLocation, useNavigate } from "react-router-dom";
import { groupConversations } from "@/utils";
import SidebarConversationItem from "@/components/custom/SidbarConversationItem";
import { useCompletion } from "@/context/CompletionContext";
import { Trash2Icon, MessageSquarePlus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const AppSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const isChat = location.pathname.startsWith("/chat")
  const rootPath = isChat ? "chat" : "completion"

  console.log(isChat, rootPath)
  const {
    conversations, 
    clearConversations, 
    deleteConversation
  } = isChat ? useChat() : useCompletion()

  const grouped = groupConversations(conversations)

  const handleClearConveration = () => {
    clearConversations()
    navigate(isChat ? "/chat" : "/completion")
  }

  const handleNewConverstion = () => {
    navigate(isChat ? "/chat": "/completion")
  }
  
  return (
   <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="border-b px-4 py-2 mb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <Button
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            onClick={handleNewConverstion}
          >
            <MessageSquarePlus className="h-4 w-4" />
            New conversation
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-13rem)]">
          <SidebarMenu className="p-2">
            {Object.entries(grouped).map(([label,items]) => items.length > 0 && (
                <div key={label} className="mb-4">
                  <div className="px-4 py-2 text-sm font-medium text-gray-500">{label}</div> 
                    {items.map((c:Conversation) => {
                      return (
                        <SidebarConversationItem 
                          key={c.id}
                          c={c}
                          root={rootPath}
                          isActive={location.pathname === `/${rootPath}/${c.id}`}
                          onDelete={deleteConversation}
                        />
                    )
                  })}
                </div>
              )
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full capitalize text-orange-500 hover:text-orange-600 hover:bg-orange-50"
            >
              <Trash2Icon className="!h-4 !w-4" />
              clear all
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all your conversations.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-orange-500" 
                onClick={() => handleClearConveration()}
              >Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarFooter>
    </Sidebar>
  )
}


export default AppSidebar;
