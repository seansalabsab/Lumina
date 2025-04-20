import { useSidebar } from "../ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import { splitTextByContentType } from "@/utils";
import MarkdownView from "./MarkdownView";
export const MarkdownWithCode = ({ text }: {text: string}) => {
  const {open} = useSidebar()

  const parts = splitTextByContentType(text)
  
  return (
    <div>
      {parts.map((t,index) => {
        if (t.type === "think") {
          return (
            <Collapsible key={index} className="px-5 py-2">
              <CollapsibleTrigger 
                className="flex items-center border-1 bg-red-200 rounded-xs w-full"
              >🧠 Reasoning</CollapsibleTrigger>
              <CollapsibleContent>
                <MarkdownView text={t.text} open={open} />
              </CollapsibleContent>
            </Collapsible>
          ) 
        } else {
          return (
            <MarkdownView text={t.text} open={open} />
            )
        }
      })}
    </div>
  )
}

export default MarkdownWithCode;
