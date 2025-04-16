import apiClient from './api'
import {
  RunningModel, 
  LocalModel,
  ApiEndpoints
} from './types'

export async function fetchLocalModels(
  onSuccess: (models: LocalModel[]) => void,
  onError: (err: any) => void
){
  return apiClient.request<{data: { models: LocalModel[]}}>(
    ApiEndpoints.LIST_LOCAL_MODELS,
    "GET",
    undefined,
    undefined,
    (data) => onSuccess(data.data.models),
    (error) => onError(error),
  )
}

export async function fetchRunningModels(
  onSuccess: (models: RunningModel[]) => void,
  onError: (err: any) => void
){
  return apiClient.request<{data: { models: RunningModel[]}}>(
    ApiEndpoints.LIST_RUNNING_MODLES,
    "GET",
    undefined,
    undefined,
    (data) => onSuccess(data.data.models),
    (error) => onError(error),
  )
}

