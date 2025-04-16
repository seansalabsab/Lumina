import {
  GenerateCompletionReq,
  GenerateCompletionRes,
  GenerateChatReq,
  GenerateChatRes,
  ApiEndpoints
} from "@/api/types"
import apiClient from "./api"

export async function fetchGenerateCompletion(
  payload: GenerateCompletionReq,
  onSuccess: (message: string) => void,
  onError: (err: any) => void
){
  return apiClient.request<GenerateCompletionRes>(
    ApiEndpoints.COMPLETION,
    "POST",
    undefined,
    payload,
    (data) => onSuccess(data.response),
    (error) => onError(error),
  )
}

export async function fetchGenerateChat(
  payload: GenerateChatReq,
  onSuccess: (message: string) => void,
  onError: (err: any) => void
){
  return apiClient.request<GenerateChatRes>(
    ApiEndpoints.CHAT,
    "POST",
    undefined,
    payload,
    (data) => onSuccess(data.message.content),
    (error) => onError(error),
  )
}


