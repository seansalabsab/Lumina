import { Message } from "@/api/types"
import { splitTextByContentType } from "@/utils"
import MarkdownView from "./MarkdownView"
import ReasoningView from "./ReasoningView"

const AssisstanMessageView = ({m}:{m:Message}) => {
  const parts = splitTextByContentType(m.content)
  return (
    <div>
      {parts.map((part, index) => {
        if (part.type === "think") {
          return <ReasoningView key={index} text={part.text} />
        } else {
          return <MarkdownView key={index} text={part.text} />
        }
      })}
    </div>
  )
}


export default AssisstanMessageView;
