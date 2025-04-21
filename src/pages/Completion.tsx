import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input";

import SelectModel from "@/components/custom/SelectModel";
import { useLocalModel } from "@/hooks/useModels";
import { useCompletion } from "@/context/CompletionContext";
import { useNavigate, useParams } from "react-router-dom";
import ConversationView from "@/components/custom/CoversationView";
import Header from "@/global/AppHeader";
import { CornerDownLeft } from "lucide-react";
import { Settings } from "lucide-react";
import { Label } from "@/components/ui/label";
const Completion = () => {
  const [showAdvanced, setShowAdvanced] = React.useState<boolean>(false)
  const navigate = useNavigate()
  const { id } = useParams<{id:string}>()
  

  const {model, models, setModel} = useLocalModel("completion-lab")
  const {
    handleSubmit,
    isLoading,
    currentConversation,
    getNewConversation,
    setCurrentId,

    input,
    setInput,
    system,
    setSystem,
    temperature,
    setTemperature,
    seed,
    setSeed,

  } = useCompletion()

  const hasCreatedRef = React.useRef(false)
  React.useEffect(() => {
    if (!id && !hasCreatedRef.current) {
      hasCreatedRef.current = true
      const newId = getNewConversation() 
      navigate(`/completion/${newId}`)
    } else if (id) {
      setCurrentId(id)
    }
  },[id, navigate])

  const handleFormSubmit = (e:React.FormEvent) => {
    if (model){
      handleSubmit(e, model.name)
    }
      
  }

  const isActive = (!isLoading) && (input.trim() !== "") && model 

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <div className="flex-1 overflow-y-auto p-4">
        <ConversationView c={currentConversation} />
      </div>
       

      <div className="p-4 border-t">
        {!showAdvanced ? (
          <form onSubmit={handleFormSubmit} className="flex-col">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="bg-white flex-1 mb-4 focus-visible:ring-0 min-h-24"
              disabled={isLoading}
            />
            <div className="flex justify-between gap-4">
              <SelectModel 
                model={model} 
                setModel={setModel} 
                models={models} 
                className="flex-1 focus:ring-0 h-10 focus:outline-none"
              />
            
              <Button
                className={`flex bg-gray-300 h-10 text-gray-600 p-4 
                  ${isActive ? "bg-cyan-500 text-white": ""}`}
                disabled={!isActive}
                type="submit"
              > 
                <span className="">Run</span>
                <span className={`py-0.5 px-2 border-gray-400 border-1 
                  flex justify-center items-center rounded-sm ${isActive ? "border-white": ""}`}>
                  <CornerDownLeft className="" />  
                </span>
              </Button>
              <Button
                className={`flex h-10 w-10 bg-black text-gray-100 border-gray-300 
                  p-4 cursor-pointer hover:text-white`}
                onClick={() => setShowAdvanced((prev:boolean) => !prev)}
              > 
                  <Settings className="!h-5 !w-5" />  
              </Button>

            </div>
          </form>

        ):(

          <div className="flex-col">
            <Textarea
              value={system}
              onChange={(e) => setSystem(e.target.value)}
              placeholder="Enter system prompt..."
              className="bg-white flex-1 mb-4 focus-visible:ring-0 min-h-24"
            />

            <div className="flex justify-between gap-4 h-10">
              <Input
                type="number"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="bg-white"
                placeholder="Enter seed (optional)"
              />

              <Label className="text-nowrap" htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
                className="w-full text-cyan-300"
                color="cyan"
              />

              <Button
                variant="outline"
                onClick={() => setShowAdvanced(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setShowAdvanced(false)}
              >
                Save
              </Button>

            </div>
          </div>
        )}
      </div>
    </div>
  )

}

export default Completion;
