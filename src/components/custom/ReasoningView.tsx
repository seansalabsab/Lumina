import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import MarkdownView from "./MarkdownView";

const ReasoningView = ({text}:{text:string}) => {
  return (
      <Collapsible className="p-4">
        <CollapsibleTrigger 
          className="bg-background flex items-center border-1 rounded-xs w-full px-5 py-2 data-[state=open]:border-b-transparent"
        >🧠 Reasoning</CollapsibleTrigger>
        <CollapsibleContent className="px-5 border-1 rounded-xs data-[state=open]:border-t-transparent">
          <MarkdownView text={text} />
        </CollapsibleContent>
      </Collapsible>
  )
}

export default ReasoningView;
