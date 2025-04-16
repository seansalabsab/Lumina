import apiClient from './api'
import {
  RunningModel, 
  LocalModel,
  ApiEndpoints
} from './types'
import { ListRunningModelsRes, ListLocalModelsRes } from './types'

export async function fetchLocalModels(
  onSuccess: (models: LocalModel[]) => void,
  onError: (err: any) => void
){
  return apiClient.request<ListLocalModelsRes>(
    ApiEndpoints.LIST_LOCAL_MODELS,
    "GET",
    undefined,
    undefined,
    (data) => onSuccess(data.models),
    (error) => onError(error),
  )
}

export async function fetchRunningModels(
  onSuccess: (models: RunningModel[]) => void,
  onError: (err: any) => void
){
  return apiClient.request<ListRunningModelsRes>(
    ApiEndpoints.LIST_RUNNING_MODLES,
    "GET",
    undefined,
    undefined,
    (data) => onSuccess(data.models),
    (error) => onError(error),
  )
}

