'use client';
import { useState, useEffect } from 'react';
import { getAllTags, Site } from '@/data/sites';
import { storageService } from '@/services/storage';
import AddSiteModal from '@/components/AddSiteModal';
import { Pencil, Trash2, Plus, ArrowLeft, Lock, ExternalLink, GripVertical, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { config } from '@/config';

// 使用配置中的密码
const ADMIN_PASSWORD = config.admin.password;

interface TagListProps {
  tags: string[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  onTagsReorder: (newTags: string[]) => void;
  onTagDelete: (tag: string) => void;
  onTagRename: (oldTag: string, newTag: string) => void;
}

// 左侧标签列表组件
function TagList({ tags, selectedTag, onTagSelect, onTagsReorder, onTagDelete, onTagRename }: TagListProps) {
  const [draggedTag, setDraggedTag] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');

  const handleDragStart = (tag: string) => {
    if (editingTag) return; // 编辑时禁止拖拽
    setDraggedTag(tag);
  };

  const handleDragOver = (e: React.DragEvent, targetTag: string) => {
    e.preventDefault();
    if (!draggedTag || draggedTag === targetTag) return;
    if (targetTag === 'all' || targetTag === 'uncategorized') return; // 禁止拖到特殊标签

    const newTags = [...tags];
    const draggedIndex = newTags.indexOf(draggedTag);
    const targetIndex = newTags.indexOf(targetTag);

    newTags.splice(draggedIndex, 1);
    newTags.splice(targetIndex, 0, draggedTag);

    onTagsReorder(newTags);
  };

  const startEditing = (tag: string) => {
    setEditingTag(tag);
    setNewTagName(tag);
  };

  const handleRename = () => {
    if (editingTag && newTagName && newTagName !== editingTag) {
      onTagRename(editingTag, newTagName);
    }
    setEditingTag(null);
    setNewTagName('');
  };

  const getSiteCount = (tag: string) => {
    const sites = storageService.getSites();
    if (tag === 'all') return sites.length;
    if (tag === 'uncategorized') return sites.filter(site => site.tags.length === 0).length;
    return sites.filter(site => site.tags.includes(tag)).length;
  };

  return (
    <div className="w-64 bg-white dark:bg-[#232323] rounded-lg p-4 h-[calc(100vh-12rem)] overflow-y-auto">
      <h2 className="text-lg font-medium mb-4">标签管理</h2>
      
      {/* 全部和未分类选项 */}
      {['all', 'uncategorized'].map(specialTag => (
        <div
          key={specialTag}
          onClick={() => onTagSelect(specialTag)}
          className={`flex items-center px-4 py-2 rounded-lg cursor-pointer mb-2
            ${selectedTag === specialTag 
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          {specialTag === 'all' ? '全部' : '未分类'}
          <span className="ml-auto text-sm text-gray-500">
            {getSiteCount(specialTag)}
          </span>
        </div>
      ))}

      {/* 可拖拽的标签列表 */}
      {tags.map(tag => (
        <div
          key={tag}
          draggable={!editingTag}
          onDragStart={() => handleDragStart(tag)}
          onDragOver={(e) => handleDragOver(e, tag)}
          onDragEnd={() => setDraggedTag(null)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-2
            ${selectedTag === tag 
              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
            ${draggedTag === tag ? 'opacity-50' : ''}`}
        >
          {editingTag === tag ? (
            // 编辑模式
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700 rounded"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setEditingTag(null);
                }}
                autoFocus
              />
              <button
                onClick={handleRename}
                className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => setEditingTag(null)}
                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            // 显示模式
            <>
              <GripVertical size={16} className="text-gray-400 cursor-move" />
              <span
                className="flex-1 cursor-pointer"
                onClick={() => onTagSelect(tag)}
              >
                {tag}
              </span>
              <span className="text-sm text-gray-500">
                {getSiteCount(tag)}
              </span>
              <button
                onClick={() => startEditing(tag)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onTagDelete(tag)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sites, setSites] = useState<Site[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState('all');
  const [mounted, setMounted] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | undefined>();
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newSite, setNewSite] = useState<Site>({
    title: '',
    description: '',
    url: '',
    tags: [],
  });
  const [newTag, setNewTag] = useState('');

  // 检查本地存储的认证状态
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    setSites(storageService.getSites());
    setTags(getAllTags());
    setMounted(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuthenticated', 'true');
      setError('');
    } else {
      setError('密码错误');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    setPassword('');
  };

  // 过滤网站
  const filteredSites = selectedTag === 'all' 
    ? sites 
    : selectedTag === 'uncategorized'
      ? sites.filter(site => site.tags.length === 0)
      : sites.filter(site => site.tags.includes(selectedTag));

  const handleTagsReorder = (newTags: string[]) => {
    setTags(newTags);
    localStorage.setItem('tagOrder', JSON.stringify(newTags));
  };

  const handleTagDelete = (tagToDelete: string) => {
    if (!confirm(`确定要删除标签 "${tagToDelete}" 吗？`)) return;

    // 更新所有站点，移除被删除的标签
    const updatedSites = sites.map(site => ({
      ...site,
      tags: site.tags.filter(tag => tag !== tagToDelete)
    }));

    setSites(updatedSites);
    setTags(tags.filter(tag => tag !== tagToDelete));
    storageService.saveSites(updatedSites);
    
    // 只有当删除的是当前选中的标签时，才切换到"全部"
    if (selectedTag === tagToDelete) {
      setSelectedTag('all');
    }
  };

  const handleTagRename = (oldTag: string, newTag: string) => {
    if (tags.includes(newTag)) {
      alert('标签名已存在');
      return;
    }

    // 更新所有站点中的标签名
    const updatedSites = sites.map(site => ({
      ...site,
      tags: site.tags.map(tag => tag === oldTag ? newTag : tag)
    }));

    setSites(updatedSites);
    setTags(tags.map(tag => tag === oldTag ? newTag : tag));
    storageService.saveSites(updatedSites);

    // 如果当前选中的是被重命名的标签，更新选中状态为新标签名
    if (selectedTag === oldTag) {
      setSelectedTag(newTag);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-200 flex items-center justify-center">
        <div className="w-full max-w-sm p-6 bg-white dark:bg-[#232323] rounded-lg shadow-md">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <Lock className="w-6 h-6 text-primary-500" />
            </div>
          </div>
          <h1 className="text-xl font-medium text-center mb-6">管理员登录</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-3 py-2 bg-white dark:bg-[#2a2a2a] rounded-lg 
                  border border-gray-200 dark:border-gray-700
                  focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-primary-500 text-white rounded-lg 
                hover:bg-primary-600 transition-colors"
            >
              登录
            </button>
            <Link
              href="/"
              className="block text-center text-sm text-gray-500 hover:text-gray-700 
                dark:text-gray-400 dark:hover:text-gray-200"
            >
              返回首页
            </Link>
          </form>
        </div>
      </div>
    );
  }

  const handleAddOrUpdateSite = (site: Site) => {
    if (editingSite) {
      storageService.updateSite(editingSite.url, site);
      setSites(storageService.getSites());
      setEditingSite(undefined);
    } else {
      storageService.addSite(site);
      setSites(storageService.getSites());
    }
  };

  const handleDeleteSites = () => {
    if (selectedSites.length === 0) return;
    
    if (confirm(`确定要删除选中的 ${selectedSites.length} 个网站吗？`)) {
      storageService.deleteSites(selectedSites);
      setSites(storageService.getSites());
      setSelectedSites([]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedSites(checked ? sites.map(site => site.url) : []);
  };

  const handleSelectSite = (url: string, checked: boolean) => {
    setSelectedSites(prev => 
      checked ? [...prev, url] : prev.filter(siteUrl => siteUrl !== url)
    );
  };

  const handleDelete = (url: string) => {
    const newSites = sites.filter(site => site.url !== url);
    setSites(newSites);
    storageService.saveSites(newSites); // 确保更新本地存储
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.title || !newSite.description || !newSite.url) {
      alert('请填写完整信息');
      return;
    }

    const updatedSites = [...sites, { ...newSite, tags: [...newSite.tags] }];
    setSites(updatedSites);
    storageService.saveSites(updatedSites);

    setNewSite({
      title: '',
      description: '',
      url: '',
      tags: [],
    });
    setNewTag('');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag) return;
    if (newSite.tags.includes(newTag)) {
      alert('标签已存在');
      return;
    }
    setNewSite(prev => ({
      ...prev,
      tags: [...prev.tags, newTag],
    }));
    setNewTag('');
  };

  // 新增：更新站点标签顺序
  const handleUpdateSiteTags = (siteUrl: string, newTags: string[]) => {
    const updatedSites = sites.map(site => 
      site.url === siteUrl ? { ...site, tags: newTags } : site
    );
    setSites(updatedSites);
    storageService.saveSites(updatedSites);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-200">
      <div className="max-w-7xl mx-auto p-4">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 
                hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft size={20} />
              <span>返回首页</span>
            </Link>
            <h1 className="text-xl font-medium">网站管理</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700 
                dark:text-gray-400 dark:hover:text-gray-200"
            >
              退出登录
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white 
                rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Plus size={18} />
              添加网站
            </button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="搜索网站..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700
              bg-white dark:bg-[#232323] focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 批量操作 */}
        {selectedSites.length > 0 && (
          <div className="mb-4 p-3 bg-white dark:bg-[#232323] rounded-lg 
            border border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              已选择 {selectedSites.length} 个网站
            </span>
            <button
              onClick={handleDeleteSites}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              删除选中
            </button>
          </div>
        )}

        {/* 主要内容区 */}
        <div className="flex gap-6">
          {/* 左侧标签列表 */}
          <TagList
            tags={tags}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
            onTagsReorder={handleTagsReorder}
            onTagDelete={handleTagDelete}
            onTagRename={handleTagRename}
          />

          {/* 右侧站点列表 */}
          <div className="flex-1 bg-white dark:bg-[#232323] rounded-lg p-4 h-[calc(100vh-12rem)] overflow-y-auto">
            <div className="grid gap-4">
              {filteredSites.map(site => (
                <div
                  key={site.url}
                  className="flex items-start justify-between p-4 bg-gray-50 
                    dark:bg-gray-800/50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{site.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {site.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {site.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full
                            bg-primary-100 dark:bg-primary-900/30 
                            text-primary-700 dark:text-primary-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSite(site);
                      setIsAddModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:text-primary-500 
                      dark:text-gray-400 dark:hover:text-primary-400"
                  >
                    <Pencil size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddSiteModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSite(undefined);
        }}
        onSubmit={handleAddOrUpdateSite}
        existingTags={tags}
        editingSite={editingSite}
      />
    </div>
  );
} 