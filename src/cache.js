const vscode = require("vscode");
import Logger from "./logger.js";

/**
 * LRU Cache Manager for PDF documents
 * Limits memory usage by evicting least recently used entries
 */
class PDFCacheManager {
    constructor(maxSize = 3) {
        this.cache = new Map(); // uri -> {data, lastAccess, size}
        this.maxSize = maxSize;
    }

    /**
     * Get cached data for a URI
     * @param {vscode.Uri} uri
     * @returns {Uint8Array|null} Raw data or null if not cached
     */
    get(uri) {
        const key = uri.toString();
        const entry = this.cache.get(key);
        if (entry) {
            entry.lastAccess = Date.now();
            Logger.log(`Cache hit for ${uri.fsPath}`);
            return entry.data;
        }
        Logger.log(`Cache miss for ${uri.fsPath}`);
        return null;
    }

    /**
     * Set cached data for a URI
     * @param {vscode.Uri} uri
     * @param {Uint8Array} data Raw binary data
     * @param {number} size Original file size in bytes
     */
    set(uri, data, size) {
        const key = uri.toString();

        // If cache is full, evict least recently used entry
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            const entries = Array.from(this.cache.entries());
            const oldest = entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess)[0];
            this.cache.delete(oldest[0]);
            Logger.log(`Cache evicted: ${oldest[0]} (LRU policy)`);
        }

        this.cache.set(key, {
            data,
            lastAccess: Date.now(),
            size
        });

        Logger.log(`Cache stored: ${uri.fsPath} (${this.cache.size}/${this.maxSize})`);
    }

    /**
     * Check if URI is cached
     * @param {vscode.Uri} uri 
     * @returns {boolean}
     */
    has(uri) {
        return this.cache.has(uri.toString());
    }

    /**
     * Clear all cached entries
     */
    clear() {
        const count = this.cache.size;
        this.cache.clear();
        Logger.log(`Cache cleared: ${count} entries removed`);
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache stats
     */
    getStats() {
        const entries = Array.from(this.cache.values());
        const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
        return {
            count: this.cache.size,
            maxSize: this.maxSize,
            totalSize,
            entries: Array.from(this.cache.keys())
        };
    }
}

export default PDFCacheManager;
