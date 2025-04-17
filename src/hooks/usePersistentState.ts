import React from "react";
import { logger } from "@/utils/logger";

type StorageType = "localstorage" | "sessionStorage"

export function usePersistentState<T>(
  key: string,
  defaultValue: T,
  storageType: StorageType = "localstorage"
): [T, (value:T) => void] {
  const storage = storageType === "localstorage" ? localStorage : sessionStorage

  // Load initial state from storage or use default
  const [state, setState] = React.useState<T>(() => {
    try {
      const storedValue = storage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      logger.error(`Error loading ${key} from storage:`, error);
      return defaultValue;
    } 
  })
  
  // update storage when state changes
  React.useEffect(() => {
    try {
      storage.setItem(key, JSON.stringify(state))
    } catch (error) {
      logger.error(`Error saving ${key} to storage`, error)
    }
  },[key, state, storage]);

  return [state,setState]
}
