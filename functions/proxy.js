export async function onRequest(context) {
  const { request } = context;
  
  try {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");
    if (!targetUrl) return badRequest("Missing URL parameter");
    
    if (request.method === "OPTIONS") return handleOptions(request);
    
    // 获取目标资源
    const response = await fetchTarget(targetUrl, request);
    
    // 处理目标服务器错误
    if (response.status >= 400) {
      const errorText = await response.text();
      throw new Error(`Target server error: ${response.status} - ${errorText.slice(0, 100)}`);
    }
    
    // 创建代理响应
    const proxyResponse = new Response(response.body, {
      status: response.status,
      headers: new Headers(response.headers)
    });
    
    // 添加 CORS 头
    proxyResponse.headers.set("Access-Control-Allow-Origin", "*");
    proxyResponse.headers.set("Vary", "Origin");
    
    // 确保内容类型
    ensureContentType(proxyResponse.headers);
    
    // 为可下载文件添加头
    if (isDownloadable(proxyResponse.headers)) {
      addDownloadHeaders(proxyResponse.headers, targetUrl);
    }
    
    return proxyResponse;

  } catch (error) {
    return handleError(error);
  }
}

// 辅助函数
function badRequest(message) {
  return new Response(message, { status: 400, headers: { "Content-Type": "text/plain" } });
}

function handleOptions(request) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin"
    },
    status: 204
  });
}

async function fetchTarget(targetUrl, originalRequest) {
  const proxyHeaders = new Headers();
  ["content-type", "accept", "range"].forEach(header => {
    if (originalRequest.headers.has(header)) {
      proxyHeaders.set(header, originalRequest.headers.get(header));
    }
  });
  
  return fetch(targetUrl, {
    method: originalRequest.method,
    headers: proxyHeaders,
    body: originalRequest.body,
    redirect: "follow"
  });
}

function ensureContentType(headers) {
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/octet-stream");
  }
}

function isDownloadable(headers) {
  const contentType = headers.get("Content-Type") || "";
  return /application\/|octet-stream|zip|pdf|excel|word/i.test(contentType);
}

function addDownloadHeaders(headers, targetUrl) {
  let filename = "download";
  
  // 从 Content-Disposition 提取文件名
  const cdHeader = headers.get("Content-Disposition");
  if (cdHeader && cdHeader.includes("filename=")) {
    filename = cdHeader.split("filename=")[1].replace(/["']/g, "");
  } 
  // 从 URL 提取文件名
  else {
    const pathParts = targetUrl.split("/");
    const lastPart = pathParts.pop() || "download";
    filename = lastPart.split(/[?#]/)[0];
  }
  
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
}

function handleError(error) {
  return new Response(JSON.stringify({
    error: "Proxy Error",
    message: error.message
  }), {
    status: 500,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}