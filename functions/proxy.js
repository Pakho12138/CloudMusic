export async function onRequest({ request, params, env }) {
  try {
    // 4. 创建新请求对象（移除浏览器特定头）
    const headers = new Headers(request.headers);
    headers.delete('cookie'); // 按需传递cookie
    headers.delete('host');
    headers.set('X-Proxy-Source', 'cloudflare-pages');

    // 5. 添加API认证（使用环境变量）
    if (env.API_KEY) {
      headers.set('Authorization', `Bearer ${env.API_KEY}`);
    }

    // 6. 转发请求
    const proxyRequest = new Request(params.url, {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'follow',
    });

    // 7. 获取响应
    const response = await fetch(proxyRequest);

    // 8. 创建可修改的响应副本
    const proxyResponse = new Response(response.body, response);

    // 9. 设置CORS头（可选）
    proxyResponse.headers.set('Access-Control-Allow-Origin', '*');
    proxyResponse.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );

    // 10. 添加安全头
    proxyResponse.headers.set('X-Content-Type-Options', 'nosniff');
    proxyResponse.headers.set('X-Frame-Options', 'DENY');

    return proxyResponse;
  } catch (error) {
    // 错误处理
    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
