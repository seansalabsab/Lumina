import React from "react";
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}
const IconButton = ({children, className = "", ...props}: IconButtonProps) => {
  return (
    <button className={`hover:bg-cyan-300/20 ${className} p-1.5 rounded-md transition-all cursor-pointer`} {...props}>
      {children}
    </button>
      
  )
}

export default IconButton
