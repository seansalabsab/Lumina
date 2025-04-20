import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible";
import MarkdownView from "./MarkdownView";

const ReasoningView = ({text}:{text:string}) => {
  return (
      <Collapsible className="px-5 py-2">
        <CollapsibleTrigger 
          className="flex items-center border-1 bg-red-200 rounded-xs w-full"
        >🧠 Reasoning</CollapsibleTrigger>
        <CollapsibleContent>
          <MarkdownView text={text} />
        </CollapsibleContent>
      </Collapsible>
  )
}

export default ReasoningView;
