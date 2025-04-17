
import React from "react";
import { LocalModel, RunningModel} from "@/api/types"
import { usePersistentState } from "@/hooks/usePersistentState"
import { fetchLocalModels, fetchRunningModels } from "@/api/models";
import { logger } from "@/utils/logger";

export function useLocalModel(storageKey: string) {
  const [model, setModel] = usePersistentState<LocalModel | null>(storageKey, null); 
  const [models, setModels] = React.useState<LocalModel[]>([])

  React.useEffect(() => {
    fetchLocalModels(
      (ms) => {
        setModels(ms)
        if (!model && ms.length > 0) {
          setModel(models[0])
          logger.log("the model set to ", models[0].name)
        }
      },
      (err) => logger.error(err)
    )
  },[])

  return {model, models, setModel}
}
export function useRunningModel() {
  const [models, setModels] = React.useState<RunningModel[]>([])
  const refetch = () => {
    fetchRunningModels(
      (ms) => setModels(ms),
      (err) => logger.error(err)
    )
  }

  React.useEffect(() => {
    refetch()
  },[])

  return {models, refetch}
}


