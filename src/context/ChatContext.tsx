
import React from "react"
import {v4 as uuidv4} from "uuid"
import  {Message, Conversation }from "@/api/types";
import { fetchGenerateChatStream } from "@/api/generate-stream";
import { GenerateChatReq, GenerateCompletionReq } from "@/api/types";
import { fetchGenerateCompletion } from "@/api/generate";

const STORAGE_KEY = "chat-conversations";


interface ChatContextType {
  conversations: Conversation[];
  currentId: string | null;
  setCurrentId: (id: string) => void;
  addMessageToCurrent: (message: Message) => void;
  updateLastAssistantMessage: (content: string) => void;
  getNewConversation: () => string;
  clearConversations: () => void;
  getCurrentConversation: () => Conversation | null;
  currentConversation: Conversation | null;
  deleteConversation: (id:string) => void;

  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent, modelName: string) => void;
  isLoading: boolean;
}

const ChatContext = React.createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const [conversations, setConversations] = React.useState<Conversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved): [];
  })
  const [currentId, setCurrentId] = React.useState<string|null>(null)
  const [input, setInput]=React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  React.useEffect(() => {
    localStorage.setItem("chat-conversations", JSON.stringify(conversations));
  },[conversations])
  
  const getCurrentConversation = ():Conversation | null => {
    return conversations.find((c:Conversation) => c.id === currentId) || null;
  }

  const deleteConversation = (id:string) => {
    setConversations((prevConvs) => prevConvs.filter((c:Conversation) => c.id !== id))
  }

  const renameConversation = (id:string, newTitle: string) => {
    setConversations((prevConvs) =>
      prevConvs.map((c) =>
        c.id === id ? { ...c, title: newTitle, updated_at: Date.now() } : c
      )
    );
  }

  const getNewConversation = ():string => {
    // check if currntly have any empty Conversation
    let emptConv:Conversation = conversations.filter((c:Conversation) => c.messages.length === 0)[0]
    if (!emptConv) {
      const id = uuidv4()
      emptConv = {
        id,
        title: "New Converation",
        messages:[],
        created_at: Date.now(),
        updated_at: Date.now(),
      }
      setConversations((prev:Conversation[]) => [emptConv, ...prev])
    }else{
      emptConv.created_at = Date.now()
      emptConv.updated_at = Date.now()
    }
    setCurrentId(emptConv.id)
    return emptConv.id
  }

  const addMessageToCurrent = (message: Message) => {
    setConversations((prev:Conversation[]) => 
      prev.map((conv:Conversation) => {
        if (conv.id === currentId) {
          return {...conv, messages: [...conv.messages, message], updated_at: Date.now()}
        }else {
          return conv
        } 
      })
    )
  }
  const updateLastAssistantMessage = (content: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== currentId) return conv;
        const updated = [...conv.messages];
        const last = updated[updated.length - 1];
        if (last?.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            content: last.content + content,
            updated_at: Date.now(),
          };
        }
        return { ...conv, messages: updated, updated_at: Date.now() };
      })
    );
  };

  const clearConversations = () => {
    setConversations([]);
    setCurrentId(null)    
  }


  const handleSubmit = (e:React.FormEvent, model:string) => {
    e.preventDefault()
    if (input.trim() == "") {
      console.log("the prompt can't be empty string")
      return
    }

    if (!model){
      console.log("useCompletion: the model can not be empty")
      return 
    }

    // add prompt to messages with role user
    const m:Message = {
      content: input,
      role: "user",
      creator: "user",
      created_at: Date.now(),
      updated_at: Date.now()
    }


    // specify the title
        // feaure reply or Message
    const featuredMessage:Message = {
      content: "",
      role: "assistant",
      creator: model,
      created_at: Date.now(),
      updated_at: Date.now()
    }
    
    let conv = getCurrentConversation()
    if (conv?.messages.length === 0) {
      const reqTitle :GenerateCompletionReq = {
        system : "You're a tool, that receives an input and responds exclusively with a 2-5 word summary of the topic (and absolutely no prose) based specifically on the words used in the input (not the expected output). Each word in the summary should be carefully chosen so that it's perfecly informative - and serve as a perfect title for the input. Now, return the summary for the following input",
        prompt: input,
        model: model,
        stream: false,
      }


    fetchGenerateCompletion(
      reqTitle,
      (resp) => {
        if (currentId) {
          renameConversation(currentId, resp) 
        }
      },
      (error) => console.log(error)
    )

    }

    const req: GenerateChatReq = {
      model:model,
      messages: [...(conv?.messages ?? []), m],
      stream: true,
    }

    addMessageToCurrent(m)
    addMessageToCurrent(featuredMessage)
    setInput("")
    setIsLoading(true)
   
    fetchGenerateChatStream(
      req,
      (resp) => {
        updateLastAssistantMessage(resp.message.content)
        if (resp.done) setIsLoading(false)
      },
      (err) => {
        console.log(err)
        setIsLoading(false)
      }
    ) 
  }

  const value = {
    conversations,
    currentConversation: getCurrentConversation(),
    currentId,
    setCurrentId,
    addMessageToCurrent,
    updateLastAssistantMessage,
    getNewConversation,
    clearConversations,
    getCurrentConversation,
    deleteConversation,

    setInput,
    input,
    handleSubmit,
    isLoading

  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const ctx = React.useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider")
  return ctx
}
