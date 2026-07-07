import { lazy } from 'react';

/**
 * A wrapper around React.lazy that intercepts chunk loading errors
 * (Failed to fetch dynamically imported module) and triggers a page reload.
 * This is crucial for handling updates in single-page applications where
 * previous chunk files are removed from the server after a new deploy.
 * 
 * @param {Function} importFunc - The dynamic import function, e.g., () => import('./Page')
 * @returns {React.Component} A lazy-loaded component with built-in chunk load error handling
 */
export function safeLazy(importFunc) {
  return lazy(() =>
    importFunc().catch((error) => {
      const isChunkError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.name === 'ChunkLoadError' ||
        /dynamically imported module/i.test(error.message);

      if (isChunkError) {
        const lastReload = sessionStorage.getItem('chunk-error-reload');
        const now = Date.now();

        // Prevent infinite reload loops by checking if we reloaded in the last 10 seconds
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem('chunk-error-reload', now.toString());
          window.location.reload();
          // Return a pending promise to prevent rendering while the page reloads
          return new Promise(() => {});
        }
      }

      // If it's a persistent error or not a chunk error, bubble it up to the Error Boundary
      throw error;
    })
  );
}
