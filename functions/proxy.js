export async function onRequest({ request, params, env }) {
  try {
    const headers = new Headers(request.headers);
    headers.delete('cookie'); // 按需传递cookie
    headers.delete('host');
    headers.set('X-Proxy-Source', 'cloudflare-pages');

    const proxyRequest = new Request(params.url, {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'follow',
    });

    const response = await fetch(proxyRequest);

    const proxyResponse = new Response(response.body, response);

    proxyResponse.headers.set('Access-Control-Allow-Origin', '*');
    proxyResponse.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );

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
