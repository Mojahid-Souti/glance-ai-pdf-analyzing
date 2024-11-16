// src/lib/rate-limit.ts

interface RateLimiterOptions {
    interval: number;
    uniqueTokenPerInterval: number;
  }
  
  export function rateLimit(options: RateLimiterOptions) {
    const tokenCache = new Map();
    const { interval, uniqueTokenPerInterval } = options;
  
    return {
      check: (limit: number, token: string) =>
        new Promise<void>((resolve, reject) => {
          const tokenCount = tokenCache.get(token) || [0];
          const currentTime = Date.now();
          const oldTokenCount = tokenCount[0];
          const oldTime = tokenCount[1] || currentTime;
          
          // Reset if outside interval
          if (currentTime - oldTime > interval) {
            tokenCount[0] = 1;
            tokenCount[1] = currentTime;
            tokenCache.set(token, tokenCount);
            return resolve();
          }
  
          // Check if over limit
          if (oldTokenCount > limit) {
            return reject(new Error('Rate limit exceeded'));
          }
  
          // Increment and update
          tokenCount[0] = oldTokenCount + 1;
          tokenCount[1] = oldTime;
          tokenCache.set(token, tokenCount);
  
          // Clean up old tokens
          if (tokenCache.size > uniqueTokenPerInterval) {
            const tokens = Array.from(tokenCache.keys());
            const removeCount = tokens.length - uniqueTokenPerInterval;
            tokens.slice(0, removeCount).forEach(t => tokenCache.delete(t));
          }
  
          resolve();
        }),
    };
  }