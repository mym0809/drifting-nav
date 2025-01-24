import { config } from '@/config';

export function getFaviconUrl(url: string): string | null {
  try {
    const domain = new URL(url).hostname;
    
    // 尝试每个 favicon provider
    for (const template of config.webInfo.favicon.providers) {
      try {
        const faviconUrl = template.replace('${domain}', domain);
        return faviconUrl;
      } catch {
        continue;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function getWebInfo(url: string) {
  try {
    // 由于浏览器的同源策略，我们需要通过服务器端代理来获取网页信息
    const response = await fetch('/api/fetch-web-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch web info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching web info:', error);
    return null;
  }
} 