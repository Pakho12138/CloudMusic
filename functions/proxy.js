export async function onRequest(context) {
  const { request } = context;
  
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");
    if (!targetUrl) return badRequest("Missing URL parameter");
    
    if (request.method === "OPTIONS") return handleOptions(request);
    
    // 获取目标资源（使用流式传输）
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: createProxyHeaders(request),
      body: request.body,
      redirect: "follow"
    });
    
    // 创建流式代理响应
    const proxyResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers)
    });
    
    // 添加 CORS 头
    proxyResponse.headers.set("Access-Control-Allow-Origin", "*");
    proxyResponse.headers.set("Vary", "Origin");
    
    // 确保内容类型
    ensureContentType(proxyResponse.headers);
    
    // 为可下载文件添加头（仅限成功响应）
    if (response.ok && isDownloadable(proxyResponse.headers)) {
      addDownloadHeaders(proxyResponse.headers, targetUrl);
    }
    
    return proxyResponse;

  } catch (error) {
    return handleError(error);
  }
}

// 辅助函数保持不变（仅列出修改部分）
function createProxyHeaders(originalRequest) {
  const headers = new Headers();
  // 只复制必要头信息
  const passthroughHeaders = ["range", "accept-encoding", "accept"];
  passthroughHeaders.forEach(header => {
    if (originalRequest.headers.has(header)) {
      headers.set(header, originalRequest.headers.get(header));
    }
  });
  return headers;
}