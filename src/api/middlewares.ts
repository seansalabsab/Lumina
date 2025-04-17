import { logger } from "@/utils/logger";

export async function RequestLogger(request: RequestInit, url:string):Promise<void>{
  logger.log("🔵 [API Request]", {
    url, 
    method: request.method, 
    headers:request.headers, 
    body: JSON.stringify(request.body, null,2)
  })
  if (request.body && typeof request.body == "string") {
    logger.log("body:", JSON.stringify(JSON.parse(request.body), null, 2))
  }
}


export async function ResponseLogger(response: Response, url: string):Promise<Response> {
  logger.log("🟢 [API Response]", { 
    url, 
    status: response.status, 
    response
  })
  return response;
}
