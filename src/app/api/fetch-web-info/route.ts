import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { config } from '@/config';
import { getFaviconUrl } from '@/utils/webInfo';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const selectors = config.webInfo.metadata.selectors;
    const fallback = config.webInfo.metadata.fallback;
    
    // 获取标题
    let title = '';
    for (const selector of selectors.title) {
      title = $(selector).attr('content') || $(selector).text();
      if (title) break;
    }
    title = title || fallback.title;

    // 获取描述
    let description = '';
    for (const selector of selectors.description) {
      description = $(selector).attr('content');
      if (description) break;
    }
    description = description || fallback.description;

    // 获取 favicon
    const favicon = getFaviconUrl(url);
    
    return NextResponse.json({ title, description, favicon });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch web info' },
      { status: 500 }
    );
  }
} 