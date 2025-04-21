import React from "react";
import { Conversation, Message } from "@/api/types";
import { Bot} from "lucide-react";
import MessageView from "./MessageView";

const ConversationView = ({c}:{c:Conversation}) => {

  const messagesEndRef = React.useRef<HTMLLIElement>(null)
  React.useEffect(() => {
    if (messagesEndRef.current &&  c && c.messages.length > 0 ) {
      messagesEndRef.current.scrollIntoView({behavior: "smooth"})
    }
  }, [c?.messages])


  if (!c) {
    return;
  }
  if (c.messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 text-muted-foreground h-full bg-background">
        <Bot className="h-12 w-12 mb-4 text-cyan-600" />
        <h3 className="text-lg font-medium">No messages yet</h3>
        <p className="text-sm">Start a conversation by typing a message below.</p>
      </div>
    )
  }
 return (
   <ol className="my-4 flex flex-col gap-8 mx-auto max-w-7xl">
      {c.messages.map((m:Message, index) => <MessageView key={index} m={m} />)}
     <li ref={messagesEndRef}></li> 
    </ol>

 ) 
}


export default ConversationView;
