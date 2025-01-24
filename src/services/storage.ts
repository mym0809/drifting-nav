import { config } from '@/config';
import { Site } from '@/data/sites';

const STORAGE_KEY = config.storage.key;

export const storageService = {
  getSites: () => {
    if (typeof window === 'undefined') return [];
    const sites = localStorage.getItem('sites');
    return sites ? JSON.parse(sites) : [];
  },

  saveSites: (sites: any[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('sites', JSON.stringify(sites));
  },

  addSite(site: Site) {
    const sites = this.getSites();
    sites.push(site);
    this.saveSites(sites);
  },

  updateSite(url: string, updatedSite: Site) {
    const sites = this.getSites();
    const index = sites.findIndex(site => site.url === url);
    if (index !== -1) {
      sites[index] = updatedSite;
      this.saveSites(sites);
    }
  },

  deleteSites(urls: string[]) {
    const sites = this.getSites();
    const filteredSites = sites.filter(site => !urls.includes(site.url));
    this.saveSites(filteredSites);
  }
}; 