import React from "react";
import {MessageSquarePlus} from "lucide-react"
import IconButton from "./IconButton";
interface NewConversationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const NewConversationButton = ({className="",...props}:NewConversationButtonProps) => {
  return (
    <IconButton className={`${className}`} {...props}>
      <MessageSquarePlus />
    </IconButton>
  )
}


export default NewConversationButton; 
