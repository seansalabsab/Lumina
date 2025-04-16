
import {RequestMiddleware, ResponseMiddleware} from "@/api/types"
import { RequestLogger, ResponseLogger } from "./middlewares";

const API_BASE_URL = "http://localhost:8000";

class ApiClient {
  private baseUrl:string;
  private requestMiddlewares: RequestMiddleware[] = [];
  private responseMiddlewares: ResponseMiddleware[] = [];
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.requestMiddlewares = [];
    //this.responseMiddlewares = [];
  }
  // request middleware
  onRequest(middleware: RequestMiddleware) {
    this.requestMiddlewares.push(middleware)
  }
  // response middleware
  onResponse(middleware: ResponseMiddleware) {
    this.responseMiddlewares.push(middleware)
  }
  private async applyRequestMiddleware(request: RequestInit, url: string) {
    for (const middleware of this.requestMiddlewares){
      await middleware(request, url)
    }
  }
  private async applyResponseMiddleware(response: Response, url: string): Promise<Response> {
    for (const middleware of this.responseMiddlewares){
      response = await middleware(response, url)
    }
    return response 
  }

  async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "DELETE" | "PATCH",
    options: RequestInit = {},
    body?: any,
    onSuccess?: (data: T) => void,
    onError?: (error: any) => void
  ):Promise<T | void> {
    const url = `${this.baseUrl}${endpoint}`
    const request: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined, 
    }
    await this.applyRequestMiddleware(request,url);
    try {
      let response = await fetch(url, request)
      response = await this.applyResponseMiddleware(response, url);
      if (!response.ok){
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const data: T = await response.json()
      if (onSuccess) onSuccess(data);
      return data;
    } catch (error) {
      if (onError) onError(error);
      console.error("API Error:", error);
    }
  }

  async requestStream(
    endpoint: string,
    method: "GET" | "POST",
    options: RequestInit = {},
    body?: any,
    onChunk?: (chunk: string) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    const url = `${this.baseUrl}${endpoint}`;
    const request: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    await this.applyRequestMiddleware(request, url);

    try {
      let response = await fetch(url, request);
      response = await this.applyResponseMiddleware(response, url);

      if (!response.body) throw new Error("No response body received for streaming.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        if (doneReading) break;

        const chunk = decoder.decode(value, { stream: true });
        if (onChunk) onChunk(chunk);
      }
    } catch (error) {
      if (onError) onError(error);
      console.error("Streaming API Error:", error);
    }
  } 
}

// Singleton API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Request Middlewares
apiClient.onRequest(RequestLogger)

// Response Middlewares
apiClient.onResponse(ResponseLogger)

export default apiClient;


