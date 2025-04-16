import {
  GenerateCompletionReq,
  GenerateChatCompletionReq,
  GenerateCompletionRes,
  GenerateChatCompletionRes,
  ApiEndpoints
} from "@/api/types"
import apiClient from "./api"

export async function fetchGenerateCompletion(
  payload: GenerateCompletionReq,
  onSuccess: (message: string) => void,
  onError: (err: any) => void
){
  return apiClient.request<{data: GenerateCompletionRes}>(
    ApiEndpoints.GENERATE,
    "POST",
    undefined,
    payload,
    (data) => onSuccess(data.data.response),
    (error) => onError(error),
  )
}

export async function fetchGenerateChat(
  payload: GenerateChatCompletionReq,
  onSuccess: (message: string) => void,
  onError: (err: any) => void
){
  return apiClient.request<{data: GenerateChatCompletionRes}>(
    ApiEndpoints.GENERATE_CHAT,
    "POST",
    undefined,
    payload,
    (data) => onSuccess(data.data.message.content),
    (error) => onError(error),
  )
}


