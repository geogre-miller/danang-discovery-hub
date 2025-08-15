import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface CategoryPinConfig {
  icon: string;
  color: string;
  svgIcon?: string;
  size: {
    width: number;
    height: number;
  };
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  displayName: string;
  description?: string;
  pinConfig: CategoryPinConfig;
  keywords: string[];
  isActive: boolean;
  sortOrder: number;
  parentCategory?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  count?: number;
}

class CategoryService {
  private categoriesCache: Category[] | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get all active categories
  async getCategories(forceRefresh = false): Promise<Category[]> {
    const now = Date.now();
    
    // Return cached data if available and not expired
    if (!forceRefresh && this.categoriesCache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.categoriesCache;
    }

    try {
      const response = await axios.get<ApiResponse<Category[]>>(`${API_URL}/api/categories`);
      
      if (response.data.success) {
        this.categoriesCache = response.data.data;
        this.cacheTime = now;
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await axios.get<ApiResponse<Category>>(`${API_URL}/api/categories/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Category not found');
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  // Search category by name (fuzzy matching)
  async getCategoryByName(name: string): Promise<Category | null> {
    try {
      const response = await axios.get<ApiResponse<Category>>(`${API_URL}/api/categories/search/${encodeURIComponent(name)}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return null; // Category not found
      }
    } catch (error) {
      console.error('Error searching category:', error);
      return null;
    }
  }

  // Get pin configuration for a category name
  async getPinConfig(categoryName: string): Promise<CategoryPinConfig> {
    try {
      const response = await axios.get<ApiResponse<CategoryPinConfig>>(`${API_URL}/api/categories/pin-config/${encodeURIComponent(categoryName)}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        // Return default pin config
        return {
          icon: '📍',
          color: '#e74c3c',
          size: { width: 32, height: 40 }
        };
      }
    } catch (error) {
      console.error('Error getting pin config:', error);
      // Return default pin config
      return {
        icon: '📍',
        color: '#e74c3c',
        size: { width: 32, height: 40 }
      };
    }
  }

  // Get category names for form dropdowns
  async getCategoryNames(): Promise<string[]> {
    try {
      const categories = await this.getCategories();
      return categories.map(cat => cat.displayName).sort();
    } catch (error) {
      console.error('Error getting category names:', error);
      return [];
    }
  }

  // Local helper methods for immediate use (with fallbacks)
  getCategoryColor(categoryName: string, categories: Category[] | null = null): string {
    if (!categoryName) return '#e74c3c';

    const cats = categories || this.categoriesCache;
    if (!cats) return '#e74c3c';

    const normalizedName = categoryName.toLowerCase().trim();
    
    // Try exact match
    let category = cats.find(cat => 
      cat.name.toLowerCase() === normalizedName || 
      cat.displayName.toLowerCase() === normalizedName ||
      cat.slug === normalizedName
    );

    if (category) return category.pinConfig.color;

    // Try keyword match
    category = cats.find(cat => 
      cat.keywords.some(keyword => keyword.toLowerCase() === normalizedName)
    );

    if (category) return category.pinConfig.color;

    // Try partial match
    category = cats.find(cat => 
      cat.name.toLowerCase().includes(normalizedName) ||
      cat.displayName.toLowerCase().includes(normalizedName) ||
      cat.keywords.some(keyword => keyword.toLowerCase().includes(normalizedName))
    );

    return category ? category.pinConfig.color : '#e74c3c';
  }

  getCategoryIcon(categoryName: string, categories: Category[] | null = null): string {
    if (!categoryName) return '📍';

    const cats = categories || this.categoriesCache;
    if (!cats) return '📍';

    const normalizedName = categoryName.toLowerCase().trim();
    
    // Try exact match
    let category = cats.find(cat => 
      cat.name.toLowerCase() === normalizedName || 
      cat.displayName.toLowerCase() === normalizedName ||
      cat.slug === normalizedName
    );

    if (category) return category.pinConfig.icon;

    // Try keyword match
    category = cats.find(cat => 
      cat.keywords.some(keyword => keyword.toLowerCase() === normalizedName)
    );

    if (category) return category.pinConfig.icon;

    // Try partial match
    category = cats.find(cat => 
      cat.name.toLowerCase().includes(normalizedName) ||
      cat.displayName.toLowerCase().includes(normalizedName) ||
      cat.keywords.some(keyword => keyword.toLowerCase().includes(normalizedName))
    );

    return category ? category.pinConfig.icon : '📍';
  }

  // Clear cache (useful for admin operations)
  clearCache(): void {
    this.categoriesCache = null;
    this.cacheTime = 0;
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
export default categoryService;
