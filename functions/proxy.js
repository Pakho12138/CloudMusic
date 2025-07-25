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
    
    // 为可下载文件添加头 - 修复后缀名问题
    if (isDownloadable(proxyResponse.headers)) {
      addDownloadHeaders(proxyResponse.headers, targetUrl, response.headers);
    }
    
    return proxyResponse;

  } catch (error) {
    return handleError(error);
  }
}

// 辅助函数保持不变
function badRequest(message) { /* ... */ }
function handleOptions(request) { /* ... */ }
async function fetchTarget(targetUrl, originalRequest) { /* ... */ }
function ensureContentType(headers) { /* ... */ }
function isDownloadable(headers) { /* ... */ }
function handleError(error) { /* ... */ }

// 完全重写的文件名处理函数 - 确保保留原始后缀名
function addDownloadHeaders(proxyHeaders, targetUrl, originalHeaders) {
  // 1. 优先使用原始 Content-Disposition 中的文件名
  const originalCd = originalHeaders.get("Content-Disposition");
  if (originalCd && originalCd.includes("filename=")) {
    const match = originalCd.match(/filename\s*=\s*"([^"]+)"|filename\s*=\s*([^;]+)/i);
    if (match && (match[1] || match[2])) {
      const filename = match[1] || match[2];
      proxyHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);
      return;
    }
  }

  // 2. 从 URL 路径中提取文件名（保留查询参数）
  const urlObj = new URL(targetUrl);
  const pathParts = urlObj.pathname.split('/');
  let filename = pathParts.pop() || "download";
  
  // 3. 确保文件名包含扩展名
  const extension = getFileExtension(proxyHeaders, originalHeaders);
  if (extension && !filename.includes('.')) {
    filename += `.${extension}`;
  }
  
  // 4. 保留 URL 的查询参数（如果对文件名重要）
  if (urlObj.search) {
    filename += urlObj.search.replace(/[?&]/g, '-');
  }
  
  // 5. 清理文件名中的非法字符
  filename = filename.replace(/[^a-zA-Z0-9\-_.]/g, '_');
  
  proxyHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);
}

// 从 Content-Type 或 URL 获取文件扩展名
function getFileExtension(proxyHeaders, originalHeaders) {
  // 1. 从 Content-Type 获取扩展名
  const contentType = proxyHeaders.get("Content-Type") || 
                     originalHeaders.get("Content-Type") || "";
  
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-excel': 'xls',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'text/csv': 'csv',
    'application/json': 'json'
  };
  
  for (const [mime, ext] of Object.entries(mimeToExt)) {
    if (contentType.includes(mime)) return ext;
  }
  
  // 2. 从 URL 路径获取扩展名
  const url = originalHeaders.get("X-Final-URL") || proxyHeaders.get("X-Final-URL") || "";
  if (url) {
    const urlExtMatch = url.match(/\.([a-z0-9]{2,5})(?:[?#]|$)/i);
    if (urlExtMatch) return urlExtMatch[1];
  }
  
  // 3. 默认二进制扩展名
  return 'bin';
}