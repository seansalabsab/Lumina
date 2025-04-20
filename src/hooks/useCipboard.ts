import React from "react";
import { logger } from "@/utils/logger";
export function useClipboard() {
  const [isCopied, setIsCopied] = React.useState(false)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      logger.error("Failed to copy:", error)
    }
  }

  return {copy, isCopied}
}


