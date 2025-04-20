import React from "react";


export const useStreamerProcessor = () => {
  const [thinking, setThinking] = React.useState<string | null>(null)
  const [streamedText, setStreamedText] = React.useState("")

  let thinkBuffer = '';

  const processChunk = (chunk:string) => {
    let workingChunk = chunk;
    //check if we are inside a <think> block
    if (thinkBuffer.length > 0 || workingChunk.includes('<think>')) {
      thinkBuffer += workingChunk;
      // check if </think> apeared
      if (thinkBuffer.includes('</think>')) {
        // extract the content 
        const match = thinkBuffer.match(/<think>([\s\S]*?)<\/think>/);
        if (match) {
          const thinkContent = match[1]
          setThinking(thinkContent.trim())
        }

        // Remove <think>...</think> from the stream
        thinkBuffer = '';
        workingChunk = workingChunk.replace(/<think>[\s\S]*?<\/think>/g, '')

      } else {
        // Still waiting for closing </think>, do not update normal text yet
        return;
      }
    }

    // Append cleaned normal text
    setStreamedText(prev => prev + workingChunk);
  }

  return { streamedText, thinking, processChunk };

}
