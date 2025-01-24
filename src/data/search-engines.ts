export interface SearchEngine {
  name: string;
  searchUrl: string;
}

export const searchEngines: SearchEngine[] = [
  {
    name: "本地",
    searchUrl: "local"
  },
  {
    name: "百度",
    searchUrl: "https://www.baidu.com/s?wd={query}"
  },
  {
    name: "Google",
    searchUrl: "https://www.google.com/search?q={query}"
  },
  {
    name: "Bing",
    searchUrl: "https://www.bing.com/search?q={query}"
  }
]; 