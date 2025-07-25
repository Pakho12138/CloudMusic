export async function onRequest({ request, params }) {
  try {
    // 处理 OPTIONS 预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
          "Access-Control-Max-Age": "86400"
        },
        status: 204
      });
    }

    // 准备代理请求头
    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.delete("cookie"); // 移除敏感信息
    proxyHeaders.delete("authorization");
    proxyHeaders.set("X-Proxy-Source", "cors-proxy");

    // 创建代理请求
    const proxyRequest = new Request(
      decodeURIComponent(params.url), // 解码 URL 参数
      new Request(request, {
        headers: proxyHeaders,
        redirect: "follow"
      })
    );

    // 获取第三方资源
    const response = await fetch(proxyRequest);
    
    // 创建可修改的响应副本
    const proxyResponse = new Response(response.body, response);
    
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