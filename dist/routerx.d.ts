declare module 'routerx' {

  export interface RouteParams {
    [key: string]: string;
  }

  export interface QueryParams {
    [key: string]: string;
  }

  export interface RouteInfo {
    path: string;
    params: RouteParams;
    query: QueryParams;
    hash: string;
    pattern: string;
    meta: Record<string, any>;
  }

  export interface ScrollPosition {
    x?: number;
    y?: number;
    left?: number;
    top?: number;
    el?: string;
    behavior?: ScrollBehavior;
  }

  export type ScrollBehaviorFn = (
    to: RouteInfo,
    from: RouteInfo | null,
    savedPosition: ScrollPosition | null
  ) => ScrollPosition | null | Promise<ScrollPosition | null>;

  export interface RouterXOptions {
    mode?: 'history' | 'hash';
    scrollBehavior?: ScrollBehaviorFn | ScrollPosition;
    ignoreSameNavigation?: boolean;
  }

  export type RouteHandler = (params: RouteParams, query: QueryParams, hash: string) => (() => void) | void | Promise<(() => void) | void>;
  export type NotFoundHandler = (path: string, query: QueryParams, hash: string) => void;
  export type CancellableHook = (params: RouteParams, query: QueryParams, hash: string) => boolean | void | Promise<boolean | void>;
  export type LifecycleHook = (params: RouteParams, query: QueryParams, hash: string) => void | Promise<void>;
  export type HashChangeHook = (newHash: string, oldHash: string, params: RouteParams, query: QueryParams) => void;
  export type BeforeHook = (path: string, query: QueryParams, hash: string, previousRoute: RouteInfo | null) => boolean | void | Promise<boolean | void>;
  export type AfterHook = (currentRoute: RouteInfo, previousRoute: RouteInfo | null) => void | Promise<void>;
  export type GuardFunction = (params: RouteParams, query: QueryParams, hash: string) => boolean | Promise<boolean>;
  export type LazyLoader = () => Promise<RouteHandler | { default: RouteHandler }>;

  export interface RouteOptions {
    beforeEnter?: CancellableHook;
    afterEnter?: LifecycleHook;
    beforeLeave?: CancellableHook;
    afterLeave?: LifecycleHook;
    onHashChange?: HashChangeHook;
    meta?: Record<string, any>;
  }

  export interface Plugin {
    name: string;
    init?(router: RouterX): void;
    destroy?(router: RouterX): void;
    beforeRoute?(path: string, query: QueryParams, hash: string, previous: RouteInfo | null, router: RouterX): boolean | void | Promise<boolean | void>;
    onRoute?(current: RouteInfo, previous: RouteInfo | null, router: RouterX): void | Promise<void>;
    afterRoute?(current: RouteInfo, previous: RouteInfo | null, router: RouterX): void | Promise<void>;
    on404?(current: Omit<RouteInfo, 'pattern' | 'meta'>, previous: RouteInfo | null, router: RouterX): void;
    onBeforeEnter?(route: RouteInfo, router: RouterX): boolean | void | Promise<boolean | void>;
    onAfterEnter?(route: RouteInfo, router: RouterX): void | Promise<void>;
    onBeforeLeave?(route: RouteInfo, router: RouterX): boolean | void | Promise<boolean | void>;
    onAfterLeave?(route: RouteInfo, router: RouterX): void | Promise<void>;
    onHashChange?(newHash: string, oldHash: string, currentRoute: RouteInfo, router: RouterX): void;
    [key: string]: any;
  }

  export type PluginFactory = () => Plugin;

  export class RouterX {
    mode: 'history' | 'hash';
    current: RouteInfo | null;
    previous: RouteInfo | null;
    ignoreSameNavigation: boolean;
    plugins: Plugin[];
    pluginInstances: Map<string, Plugin>;

    constructor(options?: RouterXOptions);

    // Lifecycle
    start(): void;

    // Route registration
    on(pattern: string, handler: RouteHandler, options?: RouteOptions): void;
    notFound(handler: NotFoundHandler): void;
    off(pattern: string): boolean;
    has(pattern: string): boolean;
    clear(): void;

    // Navigation
    navigate(path: string): void;
    navigateWithHash(path: string, hash?: string): void;
    replace(path: string): void;
    back(): void;
    forward(): void;
    canGoBack(): boolean;
    canGoForward(): boolean;

    // Route information & utilities
    getCurrentRoute(): RouteInfo | null;
    buildUrl(pattern: string, params?: RouteParams, query?: QueryParams, hash?: string): string;
    isCurrentRoute(pattern: string): boolean;
    normalizeEndSlash(urlPath: string): string;

    // Hooks & middleware
    before(callback: BeforeHook): void;
    beforeEach(callback: BeforeHook): void;
    after(callback: AfterHook): void;
    afterEach(callback: AfterHook): void;
    onHashChange(callback: (newHash: string, oldHash: string, currentRoute: RouteInfo) => void): () => void;

    // Advanced features
    redirect(from: string, to: string, options?: RouteOptions): void;
    lazy(pattern: string, loader: LazyLoader, options?: RouteOptions): void;
    guard(pattern: string, guardFn: GuardFunction, onBlock?: RouteHandler): boolean;
    addRouteHooks(pattern: string, hooks: RouteOptions): boolean;

    // Plugin system
    use(plugin: Plugin | PluginFactory): RouterX;
    getPlugin<T extends Plugin = Plugin>(name: string): T | null;
    hasPlugin(name: string): boolean;
    removePlugin(name: string): boolean;

    // Security & sanitization
    sanitize(value: string): string;
    sanitizePath(path: string, options?: { allowedProtocols?: string[]; fallback?: string }): string;
    isUrlSafe(url: string, allowedProtocols?: string[]): boolean;
  }

  export { RouterX as routerx };
}
