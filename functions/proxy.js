export async function onRequest(context) {
  const { request, env } = context;
  
  try {
    // 从 URL 中提取目标地址（更可靠的参数获取方式）
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");
    console.log(`Proxying request to: ${targetUrl}`);
    
    if (!targetUrl) {
      return new Response("Missing target URL parameter", { status: 400 });
    }

    // 处理 OPTIONS 预检请求
    if (request.method === "OPTIONS") {
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

    // 准备代理请求头
    const proxyHeaders = new Headers();
    
    // 仅复制安全的请求头
    const safeHeaders = ["content-type", "accept", "accept-language", "user-agent"];
    for (const header of safeHeaders) {
      if (request.headers.has(header)) {
        proxyHeaders.set(header, request.headers.get(header));
      }
    }
    
    proxyHeaders.set("X-Proxy-Source", "cors-proxy");

    // 创建代理请求
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers: proxyHeaders,
      body: request.body,
      redirect: "follow"
    });

    // 获取第三方资源
    const response = await fetch(proxyRequest);
    
    // 创建可修改的响应副本
    const proxyResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    
    // 设置跨域访问头
    proxyResponse.headers.set("Access-Control-Allow-Origin", "*");
    proxyResponse.headers.set("Vary", "Origin");
    
    return proxyResponse;

  } catch (error) {
    // 返回带 CORS 头的错误响应
    return new Response(
      JSON.stringify({
        error: "CORS proxy error",
        message: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
}