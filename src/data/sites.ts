import { storageService } from '@/services/storage';

export interface Site {
  title: string;
  description: string;
  url: string;
  category: string;
  tags: string[];
}

// 导出获取所有标签的函数
export const getAllTags = () => {
  const sites = storageService.getSites();
  return Array.from(new Set(sites.flatMap(site => site.tags))).sort();
};

// 初始数据
export const defaultSites: Site[] = [
  {
    title: "GitHub",
    description: "全球最大的代码托管平台",
    url: "https://github.com",
    category: "开发工具",
    tags: ["开发工具", "代码托管"]
  },
  {
    title: "Stack Overflow",
    description: "程序员问答社区",
    url: "https://stackoverflow.com",
    category: "开发工具",
    tags: ["开发工具", "问答社区"]
  }
];

// 如果 localStorage 中没有数据，使用默认数据
if (typeof window !== 'undefined' && storageService.getSites().length === 0) {
  storageService.saveSites(defaultSites);
}

export const sites: Site[] = [
  {
    title: "GitHub",
    description: "全球最大的代码托管平台",
    url: "https://github.com",
    category: "开发工具",
    tags: ["代码托管", "开源社区"]
  },
  {
    title: "Stack Overflow",
    description: "程序员问答社区",
    url: "https://stackoverflow.com",
    category: "开发工具",
    tags: ["问答社区", "编程学习"]
  },
  // 可以继续添加更多网站
];

export const categories = Array.from(new Set(sites.map(site => site.category)));
export const allTags = Array.from(new Set(sites.flatMap(site => site.tags))); 