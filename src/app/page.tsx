'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllTags, defaultSites } from '../data/sites';
import { searchEngines, type SearchEngine } from '@/data/search-engines';
import { Menu, X, Search, ChevronDown, Moon, Sun, Plus, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { storageService } from '@/services/storage';
import { SiteCard } from '@/components/site-card';
import { config } from '@/config';
import Image from 'next/image';

// 将事件处理逻辑提取到组件外部
const useClickOutside = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTag, setActiveTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(searchEngines[0]);
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [sites, setSites] = useState(storageService.getSites());
  const [tags, setTags] = useState(getAllTags());
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sidebarConfig = config.site?.sidebar || {
    showLogo: true,
    showTitle: true,
    showDescription: true
  };

  useEffect(() => {
    setMounted(true);
    // 添加调试日志
    console.log('Config:', config);
    console.log('Banner config:', config?.site?.banner);

    setSites(storageService.getSites());

    // 处理点击外部关闭下拉菜单
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowEngineDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (selectedEngine.searchUrl === 'local') {
      // 本地搜索
      const filtered = sites.filter(site => 
        site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSites(filtered);
    } else {
      // 外部搜索引擎
      const searchUrl = selectedEngine.searchUrl.replace('{query}', encodeURIComponent(searchQuery));
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEngineSelect = (engine: SearchEngine) => {
    setSelectedEngine(engine);
    setShowEngineDropdown(false);
  };

  const filteredSites = sites.filter(site => {
    if (!searchQuery.trim()) return true;
    const searchContent = `${site.title} ${site.description} ${site.tags.join(' ')}`.toLowerCase();
    return searchContent.includes(searchQuery.toLowerCase());
  });

  const handleStateChange = (key: string, value: any) => {
    if (key === 'sites') {
      setSites(value);
    } else if (key === 'tags') {
      setTags(value);
    } else {
      // Assuming the rest of the keys are state variables
      // eslint-disable-next-line @typescript-eslint/no-explicit-call
      (setIsSidebarOpen || setActiveTag || setSearchQuery || setSelectedEngine || setShowEngineDropdown || setTheme)(value);
    }
  };

  const scrollToTag = (tagId: string) => {
    const element = document.getElementById(tagId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      handleStateChange('activeTag', tagId);
      handleStateChange('isSidebarOpen', false); // 移动端点击后关闭侧边栏
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const tags = getAllTags().map(tag => `tag-${tag}`);
      const current = tags.find(tag => {
        const element = document.getElementById(tag);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) handleStateChange('activeTag', current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getEngineFavicon = (engine: SearchEngine) => {
    // 如果配置了图标，直接使用
    if (engine.icon) {
      return engine.icon;
    }
    
    // 本地搜索使用默认图标
    if (engine.searchUrl === 'local') {
      return '/favicon.png';
    }
    
    // 其他情况自动获取
    try {
      const url = new URL(engine.searchUrl);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
    } catch {
      return '/favicon.png';
    }
  };

  // 添加默认值和类型检查
  const bannerConfig = {
    show: false,
    image: '',
    height: '200px',
    ...(config?.site?.banner || {})
  };

  // 添加调试日志
  console.log('Final banner config:', bannerConfig);

  // 点击标签时滚动到对应区域
  const handleTagClick = (tag: string) => {
    const element = document.getElementById(`section-${tag}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveTag(tag);
    }
  };

  // 按标签分组站点
  const groupedSites = getAllTags().reduce((acc, tag) => {
    acc[tag] = sites.filter(site => site.tags?.includes(tag));
    return acc;
  }, {} as Record<string, typeof sites>);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-200">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-pulse">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-200">
      {/* 侧边栏 - 加宽到 72 */}
      <div className="w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
        <div className="sticky top-0 p-6 h-screen overflow-y-auto">
          {/* Logo 和标题 */}
          <div className="flex items-center gap-4 mb-8">
            <img 
              src={config.site?.logo || config.site?.favicon}
              alt=""
              className="w-8 h-8"
            />
            <div>
              <h1 className="font-medium">{config.site?.title}</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {config.site?.description}
              </p>
            </div>
          </div>

          {/* 标签列表 */}
          <div className="space-y-1">
            {getAllTags().map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  activeTag === tag
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1">
        {/* Banner */}
        {bannerConfig.show && bannerConfig.image && (
          <div 
            className="w-full overflow-hidden"
            style={{ 
              height: bannerConfig.height,
              backgroundImage: `url('${bannerConfig.image}')`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}

        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* 搜索栏 */}
          <div className="mb-12">
            <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
              <div className="w-40 flex-shrink-0">
                <div className="relative">
                  <select
                    value={selectedEngine.name}
                    onChange={(e) => {
                      const engine = searchEngines.find(eng => eng.name === e.target.value);
                      if (engine) setSelectedEngine(engine);
                    }}
                    className="w-full h-10 pl-12 pr-10 appearance-none rounded-lg bg-white dark:bg-gray-800  
                      border border-gray-200 dark:border-gray-700
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      text-sm cursor-pointer
                      hover:border-gray-300 dark:hover:border-gray-600"
                  >
                    {searchEngines.map(engine => (
                      <option 
                        key={engine.name} 
                        value={engine.name}
                        className="py-2 px-4"
                      >
                        {engine.name}
                      </option>
                    ))}
                  </select>
                  <img
                    src={(() => {
                      if (selectedEngine.searchUrl === 'local') {
                        return '/favicon.png';
                      }
                      try {
                        const url = new URL(selectedEngine.searchUrl);
                        return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;
                      } catch {
                        return '/favicon.png';
                      }
                    })()}
                    alt=""
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/favicon.png';
                    }}
                  />
                  <svg 
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none
                      transition-transform duration-200"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索..."
                className="flex-1 h-10 pl-4 pr-10 rounded-r-lg bg-white dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                  text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* 按标签分组显示站点 */}
          <div className="space-y-12">
            {getAllTags().map(tag => (
              <section key={tag} id={`section-${tag}`} className="scroll-mt-8">
                <h2 className="text-xl font-medium mb-6">{tag}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {groupedSites[tag].map(site => (
                    <a
                      key={site.url}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl
                        hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-black/30 
                        transition-all duration-300 border border-gray-100 dark:border-gray-700"
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=64`}
                        alt=""
                        className="w-10 h-10 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-favicon.png';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium mb-1 line-clamp-1 group-hover:text-primary-500 
                          transition-colors duration-200">
                          {site.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {site.description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
