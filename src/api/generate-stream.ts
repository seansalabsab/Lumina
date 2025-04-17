import apiClient from './api';
import { 
  ApiEndpoints, 
  GenerateCompletionReq,
  GenerateCompletionRes,
  GenerateChatReq,
  GenerateChatRes,
} from './types' 
import { logger } from '@/utils/logger';

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
        for (const element of jsonObject) {
          if (!element) continue;
          try {
            const data = JSON.parse(element);
            onSuccess(data)
          } catch (parseError) {
            logger.warn("Skipping malformed JSON chunk: ", parseError, element)
          }
        }
      } catch (error) {
        logger.error("Failed to process the chunk: ", error)
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
        for (const element of jsonObject) {
          if (!element) continue;
          try {
            const data = JSON.parse(element);
            onSuccess(data)
          } catch (parseError) {
            logger.warn("Skipping malformed JSON chunk: ", parseError, element)
          }
        }

      } catch (error) {
        logger.error("Failed to process the chunk: ", error)
        onError(error)
      }
    },
    onError
  ) 
 }
