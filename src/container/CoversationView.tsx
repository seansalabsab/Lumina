import { Conversation, Message } from "@/api/types";
import MarkdownWithCode from "@/components/custom/MarkdownWithCode";
import { formatDistanceToNow } from 'date-fns';
import { Bot } from "lucide-react";

type CoversationViewProps = {
  c:Conversation | null
}
import { Copy } from "lucide-react";

type MessageViewProps = {
  m: Message
}

const MessageView = ({m}:MessageViewProps) => {
  const isUser = m.role == "user"
  const frindlyTime = formatDistanceToNow(new Date(m.updated_at), {addSuffix: true})
  const footerString = `${isUser ? "" : m.creator + " ~ " }${frindlyTime}` 
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(m.content)
    } catch (err){
      console.error("Failed to copy!", err)
    }
  }

  return (
    <li className={`border-1 rounded-sm p-4 group`}> 
      <div className="flex justify-between text-gray-500 font-light">
        <p className="uppercase text-gray-400 px-1.5 py-1 border-gray-300 border-1 rounded-sm text-xs mb-4">{isUser ? "you" : "assisstant"}</p>
        <div 
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
          role="button"
          onClick={() => handleCopy()}
          >
          <Copy />
        </div>
      </div>
      { isUser ? m.content: <MarkdownWithCode text={m.content} />}
      <p className="text-sm text-gray-400 mt-2 text-right">{footerString}</p>
    </li>
  )
 }

const ConversationView = ({c}:CoversationViewProps) => {
  if (!c) {
    return;
  }
  if (c.messages.length === 0) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center text-center p-8 text-muted-foreground">
        <Bot className="h-12 w-12 mb-4 text-cyan-600" />
        <h3 className="text-lg font-medium">No messages yet</h3>
        <p className="text-sm">Start a conversation by typing a message below.</p>
      </div>
    )
  }
 return (
   <ol className="my-4 flex flex-col h-fit min-h-full gap-8">
      {c.messages.map((message:Message, index) => <MessageView key={index} m={message} />)}
    </ol>

 ) 
}


export default ConversationView;
