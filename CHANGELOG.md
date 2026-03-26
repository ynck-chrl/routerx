# Changelog

All notable changes to RouterX will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2026-01-27

### Added

- **Dual Routing Modes**: Support for both `history` mode (clean URLs via History API) and `hash` mode (hash-based routing for static hosting)

  ```js
  const router = new RouterX({ mode: 'hash' });  // Hash mode
  const router = new RouterX({ mode: 'history' }); // History mode (default)
  ```

- **Route Lifecycle Hooks**: Per-route hooks for fine-grained control over navigation
  - `beforeEnter` - Called before entering a route (can cancel navigation)
  - `afterEnter` - Called after the route handler executes
  - `beforeLeave` - Called before leaving a route (can cancel navigation)
  - `afterLeave` - Called after leaving a route

  ```js
  router.on('/dashboard', handler, {
    beforeEnter: async (params, query, hash) => {
      await prefetchData();
      return true;
    },
    beforeLeave: () => {
      if (hasUnsavedChanges()) {
        return confirm('Leave without saving?');
      }
      return true;
    }
  });
  ```

- **`addRouteHooks(pattern, hooks)`**: Method to attach lifecycle hooks to existing routes (useful for plugins)

- **Security Methods**:
  - `sanitize(value)` - HTML entity encoding to prevent XSS
  - `sanitizePath(path, options)` - Path normalization and traversal prevention
  - `isUrlSafe(url, allowedProtocols)` - URL validation against dangerous protocols

- **Prototype Pollution Protection**: Safe object creation from URL parameters via internal `_safeObjectFromEntries()` helper

- **Open Redirect Protection**: Navigation methods (`navigate()`, `replace()`, `navigateWithHash()`) now validate URLs before navigation

- **Dual Export**: Both `routerx` and `RouterX` are now exported for flexible imports
  ```js
  import { routerx } from 'routerx';
  import { RouterX } from 'routerx';
  ```

- **`beforeEach()` / `afterEach()` aliases**: Vue Router-style aliases for `before()` and `after()`
  ```js
  router.beforeEach((path, query, hash, previousRoute) => {
    // Runs before every route change
  });
  
  router.afterEach((currentRoute, previousRoute) => {
    // Runs after every route change
  });
  ```

- **`onHashChange()` - In-Route Hash Change Detection**: React to hash changes within the same route
  ```js
  // Route-level callback
  router.on('/docs', handler, {
    onHashChange: (newHash, oldHash, params, query) => {
      scrollToSection(newHash);
    }
  });
  
  // Global callback (returns unregister function)
  const unregister = router.onHashChange((newHash, oldHash, currentRoute) => {
    console.log(`Hash changed to #${newHash}`);
  });
  ```

- **Route Cleanup Functions**: Handlers can return a cleanup function (React useEffect pattern)
  ```js
  router.on('/docs/:product', (params) => {
    const observer = new MutationObserver(...);
    observer.observe(document.body, { childList: true });
    
    // Return cleanup function - called automatically when leaving route
    return () => observer.disconnect();
  });
  ```

- **Route Metadata**: Attach custom metadata to routes for titles, auth requirements, layouts, etc.
  ```js
  router.on('/admin/users', handler, {
    meta: {
      title: 'User Management',
      requiresAuth: true,
      layout: 'admin'
    }
  });
  
  // Access via current route
  document.title = router.current.meta.title;
  if (router.current.meta.requiresAuth) { /* check auth */ }
  ```

- **Scroll Behavior Control**: Configure scroll position on navigation
  ```js
  // Simple: scroll to top on every navigation
  const router = new RouterX({
    scrollBehavior: { top: 0 }
  });
  
  // Advanced: custom function with saved position support
  const router = new RouterX({
    scrollBehavior: (to, from, savedPosition) => {
      // Back/forward: restore saved position
      if (savedPosition) return savedPosition;
      // Hash: scroll to anchor
      if (to.hash) return { el: `#${to.hash}`, behavior: 'smooth' };
      // Default: scroll to top
      return { top: 0 };
    }
  });
  ```

### Changed

- **`init()` renamed to `start()`**: The router initialization method is now `router.start()` for clearer semantics
  ```js
  // Before
  router.init();
  
  // After
  router.start();
  ```

- **Constructor options**: Now accepts `scrollBehavior` option in addition to `mode`

- **`matchRoute()` is now async**: Supports async lifecycle hooks and guards

- **Global `before()` hooks**: Now receive `hash` parameter and can cancel navigation by returning `false`
  ```js
  router.before((path, query, hash, previousRoute) => {
    if (!isAuthenticated()) return false; // Cancel navigation
    return true;
  });
  ```

- **`guard()` method**: Now properly passes `hash` parameter to guard functions and handlers

- **`this.current` object**: Now includes `pattern` and `meta` properties alongside `path`, `params`, `query`, and `hash`

### Fixed

- Hash mode routes not matching (e.g., `#/page/1` was triggering 404)
- `guard()` not passing `hash` parameter to callbacks
- Global `before()` hooks missing `hash` in function signature
- Potential crashes from malformed URI components in `decodeURIComponent()`

### Security

- Added protection against prototype pollution via `__proto__`, `constructor`, and `prototype` keys in query parameters and route params
- Added URL validation in navigation methods to prevent open redirects
- Added `sanitize()`, `sanitizePath()`, and `isUrlSafe()` utility methods

## [0.0.1] - Initial Release

### Added

- Core routing functionality with dynamic parameters (`:id`, `:slug`)
- Wildcard routes (`*`, `**`)
- Query string parsing
- Hash fragment support
- Route guards with `guard()`
- Lazy loading with `lazy()`
- Redirects with `redirect()`
- Global hooks with `before()` and `after()`
- Plugin system with `use()`, `getPlugin()`, `hasPlugin()`, `removePlugin()`
- Navigation methods: `navigate()`, `replace()`, `back()`, `forward()`, `navigateWithHash()`
- Route management: `on()`, `off()`, `has()`, `clear()`
- URL building with `buildUrl()`
- 404 handling with `notFound()`

[0.2.2]: https://github.com/ynck-chrl/routerx/compare/v0.0.1...v0.2.2
[0.0.1]: https://github.com/ynck-chrl/routerx/releases/tag/v0.0.1
