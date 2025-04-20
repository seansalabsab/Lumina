import { Message } from "@/api/types"

const UserMessageView = ({m}:{m:Message}) => {
  return <div>{m.content}</div>
}

export default UserMessageView;
