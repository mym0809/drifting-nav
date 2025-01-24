import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Site } from '@/data/sites';
import { getWebInfo } from '@/utils/webInfo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (site: Site) => void;
  existingTags: string[];
  editingSite?: Site;
}

export default function AddSiteModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  existingTags, 
  editingSite 
}: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingSite) {
      setTitle(editingSite.title);
      setDescription(editingSite.description);
      setUrl(editingSite.url);
      setTags(editingSite.tags);
    }
  }, [editingSite]);

  const handleUrlBlur = async () => {
    if (!url || editingSite) return;
    
    setIsLoading(true);
    try {
      const webInfo = await getWebInfo(url);
      if (webInfo) {
        setTitle(webInfo.title || title);
        setDescription(webInfo.description || description);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      url,
      tags
    });
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setUrl('');
    setTags([]);
    setNewTag('');
    onClose();
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#232323] rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium">添加网站</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">网站名称</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                bg-white dark:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">描述</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                bg-white dark:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">网址</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                bg-white dark:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              onBlur={handleUrlBlur}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">标签</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                  bg-white dark:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-primary-500"
                list="existing-tags"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                添加
              </button>
            </div>
            <datalist id="existing-tags">
              {existingTags.map(tag => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full 
                    bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-primary-800 dark:hover:text-primary-200"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700
                hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg 
                hover:bg-primary-600"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 