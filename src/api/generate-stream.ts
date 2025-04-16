import apiClient from './api';
import { 
  ApiEndpoints, 
  GenerateCompletionReq,
  GenerateCompletionRes,
  GenerateChatReq,
  GenerateChatRes,
} from './types' 

export async function fetchGenerateCompletionStream (
  requestPayload: GenerateCompletionReq,
  onSuccess: (resp: GenerateCompletionRes) => void, 
  onError: (error:any) => void
) {
  // ensure the request is stream = true
  requestPayload.stream = true
  const url = ApiEndpoints.COMPLETION
  return apiClient.requestStream(
    url,
    "POST",
    undefined,
    requestPayload,
    (chunk) => {      
      try {
        const trimmedChunk = chunk.trim();

        // If the chink is empty or malformed, return early to avoid infinit
        if (!trimmedChunk) {
          return;
        }

        const jsonObject = trimmedChunk.split("\n");
        jsonObject.forEach(element => {
          try {
            const data = JSON.parse(element)
            
            if (data) {
              onSuccess(data)
            } else {
              throw new Error("failed to parse element")
            }

          } catch (parseError) {
            console.warn("Skipping malformed JSON chunk: ", parseError ,element)
            return
          }
        })
      } catch (error) {
        console.error("Failed to process the chunk: ", error)
        onError(error)
      }
    },
    onError
  ) 
 }

export async function fetchGenerateChatStream (
  requestPayload: GenerateChatReq,
  onSuccess: (res: GenerateChatRes) => void, 
  onError: (error:any) => void
) {
  // ensure it is stream = true
  requestPayload.stream = true
  const url = ApiEndpoints.CHAT
  return apiClient.requestStream(
    url,
    "POST",
    undefined,
    requestPayload,
    (chunk) => {
      try {
        const trimmedChunk = chunk.trim();

        // If the chink is empty or malformed, return early to avoid infinit
        if (!trimmedChunk) {
          return;
        }

        const jsonObject = trimmedChunk.split("\n");
        jsonObject.forEach(element => {
          try {
            const data = JSON.parse(element)
            
            if (data) {
              onSuccess(data)
            } else {
              throw new Error("failed to parse element")
            }

          } catch (parseError) {
            console.warn("Skipping malformed JSON chunk: ", parseError ,element)
            return
          }
        })
      } catch (error) {
        console.error("Failed to process the chunk: ", error)
        onError(error)
      }
    },
    onError
  ) 
 }
