'use client';

interface SiteCardProps {
  site: {
    title: string;
    description: string;
    url: string;
    tags: string[];
  };
}

export function SiteCard({ site }: SiteCardProps) {
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group p-3 bg-white dark:bg-[#232323] rounded-lg 
        hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/30 
        transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-2">
        <img
          src={`https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=32`}
          alt=""
          className="w-4 h-4"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-favicon.png';
          }}
        />
        <h3 className="font-medium group-hover:text-primary-500 transition-colors duration-300">
          {site.title}
        </h3>
      </div>
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
    </a>
  );
} 