
import React from "react";
import MarkdownWithCode from "@/components/custom/MarkdownWithCode";
import { Message } from "../api/types" 

const MessageList = ({messages}:{messages:Message[]}) => {
  return (
    <ol className="my-4 flex flex-col h-fit min-h-full gap-8">
      {messages.map((message:Message, index) => {
        if (message.role == "user") {
          return(
            <li className="max-w-[80%] rounded px-3 py-2 text-sm self-end bg-cyan-700 text-white" key={index}>{message.content}</li>
          )
        } else {
          return(
            <li className="max-w-[100%] rounded px-3 py-2 text-sm  text-black "  key={index}><MarkdownWithCode text={message.content}/></li>
          )
        }
      })}
    </ol>
  )
}

export default MessageList;
