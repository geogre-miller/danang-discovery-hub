import { PlaceAutocompleteResult, geoapifyService } from './geoapify.service';

export interface AutocompleteOptions {
  limit?: number;
  bias?: string;
  filter?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Enhanced autocomplete with caching, debouncing, and AbortController
class EnhancedGeoapifyService {
  private cache = new Map<string, CacheEntry<PlaceAutocompleteResult[]>>();
  private readonly TTL = 10 * 60 * 1000; // 10 minutes
  private readonly STORAGE_PREFIX = 'geo_cache_';
  private abortController: AbortController | null = null;
  private debounceTimer: number | null = null;
  private readonly DEBOUNCE_DELAY = 400; // 400ms debounce

  /**
   * Main autocomplete method with debouncing, caching, and abort control
   * Prevents double fetching and remembers previous selections
   */
  async autocomplete(
    query: string, 
    options: AutocompleteOptions = {},
    signal?: AbortSignal
  ): Promise<PlaceAutocompleteResult[]> {
    // Return empty array for short queries
    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = this.getCacheKey(normalizedQuery, options);

    // Check cache first (both memory and sessionStorage)
    const cachedResults = this.getFromCache(cacheKey);
    if (cachedResults) {
      return cachedResults;
    }

    // Abort previous request if still pending
    if (this.abortController) {
      this.abortController.abort();
    }

    // Create new abort controller, combining with external signal if provided
    this.abortController = new AbortController();
    const combinedSignal = signal ? this.combineSignals(signal, this.abortController.signal) : this.abortController.signal;

    try {
      // Make API call with abort signal
      const results = await this.fetchWithAbort(normalizedQuery, options, combinedSignal);
      
      // Cache successful results
      this.setCache(cacheKey, results);
      
      return results;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted, return empty array
        return [];
      }
      
      // Handle rate limiting gracefully
      if (this.isRateLimitError(error)) {
        console.warn('Geoapify rate limit reached, returning cached results or empty array');
        return [];
      }
      
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Debounced autocomplete - prevents excessive API calls
   * Use this in React components to automatically debounce user input
   */
  debouncedAutocomplete(
    query: string,
    options: AutocompleteOptions = {}
  ): Promise<PlaceAutocompleteResult[]> {
    return new Promise((resolve) => {
      // Clear existing timer
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Set new timer
      this.debounceTimer = window.setTimeout(async () => {
        try {
          const results = await this.autocomplete(query, options);
          resolve(results);
        } catch (error) {
          console.error('Debounced autocomplete error:', error);
          resolve([]);
        }
      }, this.DEBOUNCE_DELAY);
    });
  }

  /**
   * Remember mechanism: store a selected place to avoid re-fetching
   * When user reopens form, this prevents unnecessary API calls
   */
  rememberSelectedPlace(place: PlaceAutocompleteResult): void {
    try {
      sessionStorage.setItem('selected_place', JSON.stringify({
        place,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Failed to remember selected place');
    }
  }

  /**
   * Get remembered place if it exists and is still valid
   */
  getRememberedPlace(): PlaceAutocompleteResult | null {
    try {
      const stored = sessionStorage.getItem('selected_place');
      if (stored) {
        const { place, timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < this.TTL) {
          return place;
        }
      }
    } catch (e) {
      // Invalid JSON or storage error
    }
    return null;
  }

  /**
   * Clear remembered place (e.g., when form is submitted)
   */
  clearRememberedPlace(): void {
    try {
      sessionStorage.removeItem('selected_place');
    } catch (e) {
      // Silent fail
    }
  }

  /**
   * Cancel any pending requests
   */
  cancelPendingRequests(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  // Private methods

  private async fetchWithAbort(
    query: string, 
    options: AutocompleteOptions,
    signal: AbortSignal
  ): Promise<PlaceAutocompleteResult[]> {
    // Check if already aborted
    if (signal.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    // Use the existing geoapifyService with modifications for abort support
    const controller = new AbortController();
    signal.addEventListener('abort', () => controller.abort());

    try {
      const results = await geoapifyService.autocomplete(query, options);
      return results;
    } catch (error) {
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      throw error;
    }
  }

  private getCacheKey(query: string, options: AutocompleteOptions): string {
    return `${query}_${JSON.stringify(options)}`;
  }

  private getFromCache(key: string): PlaceAutocompleteResult[] | null {
    // Check memory cache first
    const memoryEntry = this.cache.get(key);
    if (memoryEntry && this.isValidEntry(memoryEntry)) {
      return memoryEntry.data;
    }

    // Check sessionStorage
    try {
      const stored = sessionStorage.getItem(this.STORAGE_PREFIX + key);
      if (stored) {
        const entry: CacheEntry<PlaceAutocompleteResult[]> = JSON.parse(stored);
        if (this.isValidEntry(entry)) {
          // Restore to memory cache
          this.cache.set(key, entry);
          return entry.data;
        }
      }
    } catch (e) {
      // Invalid JSON or storage error
    }

    return null;
  }

  private setCache(key: string, data: PlaceAutocompleteResult[]): void {
    const entry: CacheEntry<PlaceAutocompleteResult[]> = {
      data,
      timestamp: Date.now()
    };

    // Store in memory
    this.cache.set(key, entry);

    // Store in sessionStorage
    try {
      sessionStorage.setItem(this.STORAGE_PREFIX + key, JSON.stringify(entry));
    } catch (e) {
      console.warn('SessionStorage full, skipping cache for:', key);
    }
  }

  private isValidEntry(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp < this.TTL;
  }

  private isRateLimitError(error: any): boolean {
    return error?.response?.status === 429 || 
           error?.message?.includes('rate limit') ||
           error?.message?.includes('429');
  }

  private combineSignals(signal1: AbortSignal, signal2: AbortSignal): AbortSignal {
    const controller = new AbortController();
    
    const abortHandler = () => controller.abort();
    
    if (signal1.aborted || signal2.aborted) {
      controller.abort();
    } else {
      signal1.addEventListener('abort', abortHandler);
      signal2.addEventListener('abort', abortHandler);
    }
    
    return controller.signal;
  }

  /**
   * Clear all caches (useful for testing or memory management)
   */
  clearAllCaches(): void {
    this.cache.clear();
    this.clearRememberedPlace();
    
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear sessionStorage cache');
    }
  }
}

// Export singleton instance
export const enhancedGeoapifyService = new EnhancedGeoapifyService();
export default enhancedGeoapifyService;
