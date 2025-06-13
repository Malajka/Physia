import { Http2ServerResponse } from 'node:http2';
import { R as ROUTE_TYPE_HEADER, h as REROUTE_DIRECTIVE_HEADER, i as decryptString, j as createSlotValueFromString, b as renderComponent, r as renderTemplate, D as DEFAULT_404_COMPONENT, k as clientLocalsSymbol, l as clientAddressSymbol, n as REROUTABLE_STATUS_CODES, o as responseSentSymbol } from './astro/server_B181Abhk.mjs';
import { r as requestIs404Or500, n as notFound, a as redirectToFallback, b as redirectToDefaultLocale, c as requestHasLocale, e as normalizeTheLocale, d as defineMiddleware, R as RouteCache, s as sequence, f as findRouteToRewrite, m as matchRoute, g as RenderContext, h as getSetCookiesFromResponse } from './index_rBVTmNgT.mjs';
import 'cookie';
import { f as fileExtension, j as joinPaths, s as slash, p as prependForwardSlash, r as removeTrailingForwardSlash, g as appendForwardSlash, A as AstroError, L as LocalsNotAnObject } from './astro/assets-service_BsATJkoF.mjs';
import { bold, red, yellow, dim, blue } from 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './noop-middleware_YH1Z8rbt.mjs';
import { e as ensure404Route, D as DEFAULT_404_ROUTE, d as default404Instance } from './astro-designed-error-pages_CBXS45Lj.mjs';
import 'es-module-lexer';
import 'fast-glob';
import nodePath from 'node:path';
import buffer from 'node:buffer';
import crypto$1 from 'node:crypto';

function createI18nMiddleware(i18n, base, trailingSlash, format) {
  if (!i18n) return (_, next) => next();
  const payload = {
    ...i18n,
    trailingSlash,
    base,
    format};
  const _redirectToDefaultLocale = redirectToDefaultLocale(payload);
  const _noFoundForNonLocaleRoute = notFound(payload);
  const _requestHasLocale = requestHasLocale(payload.locales);
  const _redirectToFallback = redirectToFallback(payload);
  const prefixAlways = (context) => {
    const url = context.url;
    if (url.pathname === base + "/" || url.pathname === base) {
      return _redirectToDefaultLocale(context);
    } else if (!_requestHasLocale(context)) {
      return _noFoundForNonLocaleRoute(context);
    }
    return void 0;
  };
  const prefixOtherLocales = (context, response) => {
    let pathnameContainsDefaultLocale = false;
    const url = context.url;
    for (const segment of url.pathname.split("/")) {
      if (normalizeTheLocale(segment) === normalizeTheLocale(i18n.defaultLocale)) {
        pathnameContainsDefaultLocale = true;
        break;
      }
    }
    if (pathnameContainsDefaultLocale) {
      const newLocation = url.pathname.replace(`/${i18n.defaultLocale}`, "");
      response.headers.set("Location", newLocation);
      return _noFoundForNonLocaleRoute(context);
    }
    return void 0;
  };
  return async (context, next) => {
    const response = await next();
    const type = response.headers.get(ROUTE_TYPE_HEADER);
    const isReroute = response.headers.get(REROUTE_DIRECTIVE_HEADER);
    if (isReroute === "no" && typeof i18n.fallback === "undefined") {
      return response;
    }
    if (type !== "page" && type !== "fallback") {
      return response;
    }
    if (requestIs404Or500(context.request, base)) {
      return response;
    }
    const { currentLocale } = context;
    switch (i18n.strategy) {
      case "manual": {
        return response;
      }
      case "domains-prefix-other-locales": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixOtherLocales(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-other-locales": {
        const result = prefixOtherLocales(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always-no-redirect": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = _noFoundForNonLocaleRoute(context, response);
          if (result) {
            return result;
          }
        }
        break;
      }
      case "pathname-prefix-always-no-redirect": {
        const result = _noFoundForNonLocaleRoute(context, response);
        if (result) {
          return result;
        }
        break;
      }
      case "pathname-prefix-always": {
        const result = prefixAlways(context);
        if (result) {
          return result;
        }
        break;
      }
      case "domains-prefix-always": {
        if (localeHasntDomain(i18n, currentLocale)) {
          const result = prefixAlways(context);
          if (result) {
            return result;
          }
        }
        break;
      }
    }
    return _redirectToFallback(context, response);
  };
}
function localeHasntDomain(i18n, currentLocale) {
  for (const domainLocale of Object.values(i18n.domainLookupTable)) {
    if (domainLocale === currentLocale) {
      return false;
    }
  }
  return true;
}

const FORM_CONTENT_TYPES = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain"
];
function createOriginCheckMiddleware() {
  return defineMiddleware((context, next) => {
    const { request, url } = context;
    if (request.method === "GET") {
      return next();
    }
    const sameOrigin = (request.method === "POST" || request.method === "PUT" || request.method === "PATCH" || request.method === "DELETE") && request.headers.get("origin") === url.origin;
    const hasContentType = request.headers.has("content-type");
    if (hasContentType) {
      const formLikeHeader = hasFormLikeHeader(request.headers.get("content-type"));
      if (formLikeHeader && !sameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    } else {
      if (!sameOrigin) {
        return new Response(`Cross-site ${request.method} form submissions are forbidden`, {
          status: 403
        });
      }
    }
    return next();
  });
}
function hasFormLikeHeader(contentType) {
  if (contentType) {
    for (const FORM_CONTENT_TYPE of FORM_CONTENT_TYPES) {
      if (contentType.toLowerCase().includes(FORM_CONTENT_TYPE)) {
        return true;
      }
    }
  }
  return false;
}

function getPattern(segments, base, addTrailingSlash) {
  const pathname = segments.map((segment) => {
    if (segment.length === 1 && segment[0].spread) {
      return "(?:\\/(.*?))?";
    } else {
      return "\\/" + segment.map((part) => {
        if (part.spread) {
          return "(.*?)";
        } else if (part.dynamic) {
          return "([^/]+?)";
        } else {
          return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }
      }).join("");
    }
  }).join("");
  const trailing = addTrailingSlash && segments.length ? getTrailingSlashPattern(addTrailingSlash) : "$";
  let initial = "\\/";
  if (addTrailingSlash === "never" && base !== "/") {
    initial = "";
  }
  return new RegExp(`^${pathname || initial}${trailing}`);
}
function getTrailingSlashPattern(addTrailingSlash) {
  if (addTrailingSlash === "always") {
    return "\\/$";
  }
  if (addTrailingSlash === "never") {
    return "$";
  }
  return "\\/?$";
}

const SERVER_ISLAND_ROUTE = "/_server-islands/[name]";
const SERVER_ISLAND_COMPONENT = "_server-islands.astro";
function getServerIslandRouteData(config) {
  const segments = [
    [{ content: "_server-islands", dynamic: false, spread: false }],
    [{ content: "name", dynamic: true, spread: false }]
  ];
  const route = {
    type: "page",
    component: SERVER_ISLAND_COMPONENT,
    generate: () => "",
    params: ["name"],
    segments,
    pattern: getPattern(segments, config.base, config.trailingSlash),
    prerender: false,
    isIndex: false,
    fallbackRoutes: [],
    route: SERVER_ISLAND_ROUTE
  };
  return route;
}
function ensureServerIslandRoute(config, routeManifest) {
  if (routeManifest.routes.some((route) => route.route === "/_server-islands/[name]")) {
    return;
  }
  routeManifest.routes.unshift(getServerIslandRouteData(config));
}
function createEndpoint(manifest) {
  const page = async (result) => {
    const params = result.params;
    const request = result.request;
    const raw = await request.text();
    const data = JSON.parse(raw);
    if (!params.name) {
      return new Response(null, {
        status: 400,
        statusText: "Bad request"
      });
    }
    const componentId = params.name;
    const imp = manifest.serverIslandMap?.get(componentId);
    if (!imp) {
      return new Response(null, {
        status: 404,
        statusText: "Not found"
      });
    }
    const key = await manifest.key;
    const encryptedProps = data.encryptedProps;
    const propString = await decryptString(key, encryptedProps);
    const props = JSON.parse(propString);
    const componentModule = await imp();
    const Component = componentModule[data.componentExport];
    const slots = {};
    for (const prop in data.slots) {
      slots[prop] = createSlotValueFromString(data.slots[prop]);
    }
    return renderTemplate`${renderComponent(result, "Component", Component, props, slots)}`;
  };
  page.isAstroComponentFactory = true;
  const instance = {
    default: page,
    partial: true
  };
  return instance;
}

function injectDefaultRoutes(ssrManifest, routeManifest) {
  ensure404Route(routeManifest);
  ensureServerIslandRoute(ssrManifest, routeManifest);
  return routeManifest;
}
function createDefaultRoutes(manifest) {
  const root = new URL(manifest.hrefRoot);
  return [
    {
      instance: default404Instance,
      matchesComponent: (filePath) => filePath.href === new URL(DEFAULT_404_COMPONENT, root).href,
      route: DEFAULT_404_ROUTE.route,
      component: DEFAULT_404_COMPONENT
    },
    {
      instance: createEndpoint(manifest),
      matchesComponent: (filePath) => filePath.href === new URL(SERVER_ISLAND_COMPONENT, root).href,
      route: SERVER_ISLAND_ROUTE,
      component: SERVER_ISLAND_COMPONENT
    }
  ];
}

class Pipeline {
  constructor(logger, manifest, mode, renderers, resolve, serverLike, streaming, adapterName = manifest.adapterName, clientDirectives = manifest.clientDirectives, inlinedScripts = manifest.inlinedScripts, compressHTML = manifest.compressHTML, i18n = manifest.i18n, middleware = manifest.middleware, routeCache = new RouteCache(logger, mode), site = manifest.site ? new URL(manifest.site) : void 0, defaultRoutes = createDefaultRoutes(manifest)) {
    this.logger = logger;
    this.manifest = manifest;
    this.mode = mode;
    this.renderers = renderers;
    this.resolve = resolve;
    this.serverLike = serverLike;
    this.streaming = streaming;
    this.adapterName = adapterName;
    this.clientDirectives = clientDirectives;
    this.inlinedScripts = inlinedScripts;
    this.compressHTML = compressHTML;
    this.i18n = i18n;
    this.middleware = middleware;
    this.routeCache = routeCache;
    this.site = site;
    this.defaultRoutes = defaultRoutes;
    this.internalMiddleware = [];
    if (i18n?.strategy !== "manual") {
      this.internalMiddleware.push(
        createI18nMiddleware(i18n, manifest.base, manifest.trailingSlash, manifest.buildFormat)
      );
    }
  }
  internalMiddleware;
  resolvedMiddleware = void 0;
  /**
   * Resolves the middleware from the manifest, and returns the `onRequest` function. If `onRequest` isn't there,
   * it returns a no-op function
   */
  async getMiddleware() {
    if (this.resolvedMiddleware) {
      return this.resolvedMiddleware;
    } else if (this.middleware) {
      const middlewareInstance = await this.middleware();
      const onRequest = middlewareInstance.onRequest ?? NOOP_MIDDLEWARE_FN;
      if (this.manifest.checkOrigin) {
        this.resolvedMiddleware = sequence(createOriginCheckMiddleware(), onRequest);
      } else {
        this.resolvedMiddleware = onRequest;
      }
      return this.resolvedMiddleware;
    } else {
      this.resolvedMiddleware = NOOP_MIDDLEWARE_FN;
      return this.resolvedMiddleware;
    }
  }
}

const RedirectComponentInstance = {
  default() {
    return new Response(null, {
      status: 301
    });
  }
};
const RedirectSinglePageBuiltModule = {
  page: () => Promise.resolve(RedirectComponentInstance),
  onRequest: (_, next) => next(),
  renderers: []
};

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}

const consoleLogDestination = {
  write(event) {
    let dest = console.error;
    if (levels[event.level] < levels["error"]) {
      dest = console.log;
    }
    if (event.label === "SKIP_FORMAT") {
      dest(event.message);
    } else {
      dest(getEventPrefix(event) + " " + event.message);
    }
    return true;
  }
};

function getAssetsPrefix(fileExtension, assetsPrefix) {
  if (!assetsPrefix) return "";
  if (typeof assetsPrefix === "string") return assetsPrefix;
  const dotLessFileExtension = fileExtension.slice(1);
  if (assetsPrefix[dotLessFileExtension]) {
    return assetsPrefix[dotLessFileExtension];
  }
  return assetsPrefix.fallback;
}

function createAssetLink(href, base, assetsPrefix) {
  if (assetsPrefix) {
    const pf = getAssetsPrefix(fileExtension(href), assetsPrefix);
    return joinPaths(pf, slash(href));
  } else if (base) {
    return prependForwardSlash(joinPaths(base, slash(href)));
  } else {
    return href;
  }
}
function createStylesheetElement(stylesheet, base, assetsPrefix) {
  if (stylesheet.type === "inline") {
    return {
      props: {},
      children: stylesheet.content
    };
  } else {
    return {
      props: {
        rel: "stylesheet",
        href: createAssetLink(stylesheet.src, base, assetsPrefix)
      },
      children: ""
    };
  }
}
function createStylesheetElementSet(stylesheets, base, assetsPrefix) {
  return new Set(stylesheets.map((s) => createStylesheetElement(s, base, assetsPrefix)));
}
function createModuleScriptElement(script, base, assetsPrefix) {
  if (script.type === "external") {
    return createModuleScriptElementWithSrc(script.value, base, assetsPrefix);
  } else {
    return {
      props: {
        type: "module"
      },
      children: script.value
    };
  }
}
function createModuleScriptElementWithSrc(src, base, assetsPrefix) {
  return {
    props: {
      type: "module",
      src: createAssetLink(src, base, assetsPrefix)
    },
    children: ""
  };
}

class AppPipeline extends Pipeline {
  #manifestData;
  static create(manifestData, {
    logger,
    manifest,
    mode,
    renderers,
    resolve,
    serverLike,
    streaming,
    defaultRoutes
  }) {
    const pipeline = new AppPipeline(
      logger,
      manifest,
      mode,
      renderers,
      resolve,
      serverLike,
      streaming,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      void 0,
      defaultRoutes
    );
    pipeline.#manifestData = manifestData;
    return pipeline;
  }
  headElements(routeData) {
    const routeInfo = this.manifest.routes.find((route) => route.routeData === routeData);
    const links = /* @__PURE__ */ new Set();
    const scripts = /* @__PURE__ */ new Set();
    const styles = createStylesheetElementSet(routeInfo?.styles ?? []);
    for (const script of routeInfo?.scripts ?? []) {
      if ("stage" in script) {
        if (script.stage === "head-inline") {
          scripts.add({
            props: {},
            children: script.children
          });
        }
      } else {
        scripts.add(createModuleScriptElement(script));
      }
    }
    return { links, styles, scripts };
  }
  componentMetadata() {
  }
  async getComponentByRoute(routeData) {
    const module = await this.getModuleForRoute(routeData);
    return module.page();
  }
  async tryRewrite(payload, request) {
    const { newUrl, pathname, routeData } = findRouteToRewrite({
      payload,
      request,
      routes: this.manifest?.routes.map((r) => r.routeData),
      trailingSlash: this.manifest.trailingSlash,
      buildFormat: this.manifest.buildFormat,
      base: this.manifest.base
    });
    const componentInstance = await this.getComponentByRoute(routeData);
    return { newUrl, pathname, componentInstance, routeData };
  }
  async getModuleForRoute(route) {
    for (const defaultRoute of this.defaultRoutes) {
      if (route.component === defaultRoute.component) {
        return {
          page: () => Promise.resolve(defaultRoute.instance),
          renderers: []
        };
      }
    }
    if (route.type === "redirect") {
      return RedirectSinglePageBuiltModule;
    } else {
      if (this.manifest.pageMap) {
        const importComponentInstance = this.manifest.pageMap.get(route.component);
        if (!importComponentInstance) {
          throw new Error(
            `Unexpectedly unable to find a component instance for route ${route.route}`
          );
        }
        return await importComponentInstance();
      } else if (this.manifest.pageModule) {
        return this.manifest.pageModule;
      }
      throw new Error(
        "Astro couldn't find the correct page to render, probably because it wasn't correctly mapped for SSR usage. This is an internal error, please file an issue."
      );
    }
  }
}

class App {
  #manifest;
  #manifestData;
  #logger = new Logger({
    dest: consoleLogDestination,
    level: "info"
  });
  #baseWithoutTrailingSlash;
  #pipeline;
  #adapterLogger;
  #renderOptionsDeprecationWarningShown = false;
  constructor(manifest, streaming = true) {
    this.#manifest = manifest;
    this.#manifestData = injectDefaultRoutes(manifest, {
      routes: manifest.routes.map((route) => route.routeData)
    });
    this.#baseWithoutTrailingSlash = removeTrailingForwardSlash(this.#manifest.base);
    this.#pipeline = this.#createPipeline(this.#manifestData, streaming);
    this.#adapterLogger = new AstroIntegrationLogger(
      this.#logger.options,
      this.#manifest.adapterName
    );
  }
  getAdapterLogger() {
    return this.#adapterLogger;
  }
  /**
   * Creates a pipeline by reading the stored manifest
   *
   * @param manifestData
   * @param streaming
   * @private
   */
  #createPipeline(manifestData, streaming = false) {
    return AppPipeline.create(manifestData, {
      logger: this.#logger,
      manifest: this.#manifest,
      mode: "production",
      renderers: this.#manifest.renderers,
      defaultRoutes: createDefaultRoutes(this.#manifest),
      resolve: async (specifier) => {
        if (!(specifier in this.#manifest.entryModules)) {
          throw new Error(`Unable to resolve [${specifier}]`);
        }
        const bundlePath = this.#manifest.entryModules[specifier];
        if (bundlePath.startsWith("data:") || bundlePath.length === 0) {
          return bundlePath;
        } else {
          return createAssetLink(bundlePath, this.#manifest.base, this.#manifest.assetsPrefix);
        }
      },
      serverLike: true,
      streaming
    });
  }
  set setManifestData(newManifestData) {
    this.#manifestData = newManifestData;
  }
  removeBase(pathname) {
    if (pathname.startsWith(this.#manifest.base)) {
      return pathname.slice(this.#baseWithoutTrailingSlash.length + 1);
    }
    return pathname;
  }
  #getPathnameFromRequest(request) {
    const url = new URL(request.url);
    const pathname = prependForwardSlash(this.removeBase(url.pathname));
    return pathname;
  }
  match(request) {
    const url = new URL(request.url);
    if (this.#manifest.assets.has(url.pathname)) return void 0;
    let pathname = this.#computePathnameFromDomain(request);
    if (!pathname) {
      pathname = prependForwardSlash(this.removeBase(url.pathname));
    }
    let routeData = matchRoute(pathname, this.#manifestData);
    if (!routeData || routeData.prerender) return void 0;
    return routeData;
  }
  #computePathnameFromDomain(request) {
    let pathname = void 0;
    const url = new URL(request.url);
    if (this.#manifest.i18n && (this.#manifest.i18n.strategy === "domains-prefix-always" || this.#manifest.i18n.strategy === "domains-prefix-other-locales" || this.#manifest.i18n.strategy === "domains-prefix-always-no-redirect")) {
      let host = request.headers.get("X-Forwarded-Host");
      let protocol = request.headers.get("X-Forwarded-Proto");
      if (protocol) {
        protocol = protocol + ":";
      } else {
        protocol = url.protocol;
      }
      if (!host) {
        host = request.headers.get("Host");
      }
      if (host && protocol) {
        host = host.split(":")[0];
        try {
          let locale;
          const hostAsUrl = new URL(`${protocol}//${host}`);
          for (const [domainKey, localeValue] of Object.entries(
            this.#manifest.i18n.domainLookupTable
          )) {
            const domainKeyAsUrl = new URL(domainKey);
            if (hostAsUrl.host === domainKeyAsUrl.host && hostAsUrl.protocol === domainKeyAsUrl.protocol) {
              locale = localeValue;
              break;
            }
          }
          if (locale) {
            pathname = prependForwardSlash(
              joinPaths(normalizeTheLocale(locale), this.removeBase(url.pathname))
            );
            if (url.pathname.endsWith("/")) {
              pathname = appendForwardSlash(pathname);
            }
          }
        } catch (e) {
          this.#logger.error(
            "router",
            `Astro tried to parse ${protocol}//${host} as an URL, but it threw a parsing error. Check the X-Forwarded-Host and X-Forwarded-Proto headers.`
          );
          this.#logger.error("router", `Error: ${e}`);
        }
      }
    }
    return pathname;
  }
  async render(request, routeDataOrOptions, maybeLocals) {
    let routeData;
    let locals;
    let clientAddress;
    let addCookieHeader;
    if (routeDataOrOptions && ("addCookieHeader" in routeDataOrOptions || "clientAddress" in routeDataOrOptions || "locals" in routeDataOrOptions || "routeData" in routeDataOrOptions)) {
      if ("addCookieHeader" in routeDataOrOptions) {
        addCookieHeader = routeDataOrOptions.addCookieHeader;
      }
      if ("clientAddress" in routeDataOrOptions) {
        clientAddress = routeDataOrOptions.clientAddress;
      }
      if ("routeData" in routeDataOrOptions) {
        routeData = routeDataOrOptions.routeData;
      }
      if ("locals" in routeDataOrOptions) {
        locals = routeDataOrOptions.locals;
      }
    } else {
      routeData = routeDataOrOptions;
      locals = maybeLocals;
      if (routeDataOrOptions || locals) {
        this.#logRenderOptionsDeprecationWarning();
      }
    }
    if (routeData) {
      this.#logger.debug(
        "router",
        "The adapter " + this.#manifest.adapterName + " provided a custom RouteData for ",
        request.url
      );
      this.#logger.debug("router", "RouteData:\n" + routeData);
    }
    if (locals) {
      if (typeof locals !== "object") {
        const error = new AstroError(LocalsNotAnObject);
        this.#logger.error(null, error.stack);
        return this.#renderError(request, { status: 500, error });
      }
      Reflect.set(request, clientLocalsSymbol, locals);
    }
    if (clientAddress) {
      Reflect.set(request, clientAddressSymbol, clientAddress);
    }
    if (!routeData) {
      routeData = this.match(request);
      this.#logger.debug("router", "Astro matched the following route for " + request.url);
      this.#logger.debug("router", "RouteData:\n" + routeData);
    }
    if (!routeData) {
      this.#logger.debug("router", "Astro hasn't found routes that match " + request.url);
      this.#logger.debug("router", "Here's the available routes:\n", this.#manifestData);
      return this.#renderError(request, { locals, status: 404 });
    }
    const pathname = this.#getPathnameFromRequest(request);
    const defaultStatus = this.#getDefaultStatusCode(routeData, pathname);
    let response;
    try {
      const mod = await this.#pipeline.getModuleForRoute(routeData);
      const renderContext = await RenderContext.create({
        pipeline: this.#pipeline,
        locals,
        pathname,
        request,
        routeData,
        status: defaultStatus
      });
      response = await renderContext.render(await mod.page());
    } catch (err) {
      this.#logger.error(null, err.stack || err.message || String(err));
      return this.#renderError(request, { locals, status: 500, error: err });
    }
    if (REROUTABLE_STATUS_CODES.includes(response.status) && response.headers.get(REROUTE_DIRECTIVE_HEADER) !== "no") {
      return this.#renderError(request, {
        locals,
        response,
        status: response.status,
        // We don't have an error to report here. Passing null means we pass nothing intentionally
        // while undefined means there's no error
        error: response.status === 500 ? null : void 0
      });
    }
    if (response.headers.has(REROUTE_DIRECTIVE_HEADER)) {
      response.headers.delete(REROUTE_DIRECTIVE_HEADER);
    }
    if (addCookieHeader) {
      for (const setCookieHeaderValue of App.getSetCookieFromResponse(response)) {
        response.headers.append("set-cookie", setCookieHeaderValue);
      }
    }
    Reflect.set(response, responseSentSymbol, true);
    return response;
  }
  #logRenderOptionsDeprecationWarning() {
    if (this.#renderOptionsDeprecationWarningShown) return;
    this.#logger.warn(
      "deprecated",
      `The adapter ${this.#manifest.adapterName} is using a deprecated signature of the 'app.render()' method. From Astro 4.0, locals and routeData are provided as properties on an optional object to this method. Using the old signature will cause an error in Astro 5.0. See https://github.com/withastro/astro/pull/9199 for more information.`
    );
    this.#renderOptionsDeprecationWarningShown = true;
  }
  setCookieHeaders(response) {
    return getSetCookiesFromResponse(response);
  }
  /**
   * Reads all the cookies written by `Astro.cookie.set()` onto the passed response.
   * For example,
   * ```ts
   * for (const cookie_ of App.getSetCookieFromResponse(response)) {
   *     const cookie: string = cookie_
   * }
   * ```
   * @param response The response to read cookies from.
   * @returns An iterator that yields key-value pairs as equal-sign-separated strings.
   */
  static getSetCookieFromResponse = getSetCookiesFromResponse;
  /**
   * If it is a known error code, try sending the according page (e.g. 404.astro / 500.astro).
   * This also handles pre-rendered /404 or /500 routes
   */
  async #renderError(request, {
    locals,
    status,
    response: originalResponse,
    skipMiddleware = false,
    error
  }) {
    const errorRoutePath = `/${status}${this.#manifest.trailingSlash === "always" ? "/" : ""}`;
    const errorRouteData = matchRoute(errorRoutePath, this.#manifestData);
    const url = new URL(request.url);
    if (errorRouteData) {
      if (errorRouteData.prerender) {
        const maybeDotHtml = errorRouteData.route.endsWith(`/${status}`) ? ".html" : "";
        const statusURL = new URL(
          `${this.#baseWithoutTrailingSlash}/${status}${maybeDotHtml}`,
          url
        );
        if (statusURL.toString() !== request.url) {
          const response2 = await fetch(statusURL.toString());
          const override = { status };
          return this.#mergeResponses(response2, originalResponse, override);
        }
      }
      const mod = await this.#pipeline.getModuleForRoute(errorRouteData);
      try {
        const renderContext = await RenderContext.create({
          locals,
          pipeline: this.#pipeline,
          middleware: skipMiddleware ? NOOP_MIDDLEWARE_FN : void 0,
          pathname: this.#getPathnameFromRequest(request),
          request,
          routeData: errorRouteData,
          status,
          props: { error }
        });
        const response2 = await renderContext.render(await mod.page());
        return this.#mergeResponses(response2, originalResponse);
      } catch {
        if (skipMiddleware === false) {
          return this.#renderError(request, {
            locals,
            status,
            response: originalResponse,
            skipMiddleware: true
          });
        }
      }
    }
    const response = this.#mergeResponses(new Response(null, { status }), originalResponse);
    Reflect.set(response, responseSentSymbol, true);
    return response;
  }
  #mergeResponses(newResponse, originalResponse, override) {
    if (!originalResponse) {
      if (override !== void 0) {
        return new Response(newResponse.body, {
          status: override.status,
          statusText: newResponse.statusText,
          headers: newResponse.headers
        });
      }
      return newResponse;
    }
    const status = override?.status ? override.status : originalResponse.status === 200 ? newResponse.status : originalResponse.status;
    try {
      originalResponse.headers.delete("Content-type");
    } catch {
    }
    return new Response(newResponse.body, {
      status,
      statusText: status === 200 ? newResponse.statusText : originalResponse.statusText,
      // If you're looking at here for possible bugs, it means that it's not a bug.
      // With the middleware, users can meddle with headers, and we should pass to the 404/500.
      // If users see something weird, it's because they are setting some headers they should not.
      //
      // Although, we don't want it to replace the content-type, because the error page must return `text/html`
      headers: new Headers([
        ...Array.from(newResponse.headers),
        ...Array.from(originalResponse.headers)
      ])
    });
  }
  #getDefaultStatusCode(routeData, pathname) {
    if (!routeData.pattern.test(pathname)) {
      for (const fallbackRoute of routeData.fallbackRoutes) {
        if (fallbackRoute.pattern.test(pathname)) {
          return 302;
        }
      }
    }
    const route = removeTrailingForwardSlash(routeData.route);
    if (route.endsWith("/404")) return 404;
    if (route.endsWith("/500")) return 500;
    return 200;
  }
}

const createOutgoingHttpHeaders = (headers) => {
  if (!headers) {
    return void 0;
  }
  const nodeHeaders = Object.fromEntries(headers.entries());
  if (Object.keys(nodeHeaders).length === 0) {
    return void 0;
  }
  if (headers.has("set-cookie")) {
    const cookieHeaders = headers.getSetCookie();
    if (cookieHeaders.length > 1) {
      nodeHeaders["set-cookie"] = cookieHeaders;
    }
  }
  return nodeHeaders;
};

function apply() {
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, "crypto", {
      value: crypto$1.webcrypto
    });
  }
  if (!globalThis.File) {
    Object.defineProperty(globalThis, "File", {
      value: buffer.File
    });
  }
}

class NodeApp extends App {
  match(req) {
    if (!(req instanceof Request)) {
      req = NodeApp.createRequest(req, {
        skipBody: true
      });
    }
    return super.match(req);
  }
  render(req, routeDataOrOptions, maybeLocals) {
    if (!(req instanceof Request)) {
      req = NodeApp.createRequest(req);
    }
    return super.render(req, routeDataOrOptions, maybeLocals);
  }
  /**
   * Converts a NodeJS IncomingMessage into a web standard Request.
   * ```js
   * import { NodeApp } from 'astro/app/node';
   * import { createServer } from 'node:http';
   *
   * const server = createServer(async (req, res) => {
   *     const request = NodeApp.createRequest(req);
   *     const response = await app.render(request);
   *     await NodeApp.writeResponse(response, res);
   * })
   * ```
   */
  static createRequest(req, { skipBody = false } = {}) {
    const isEncrypted = "encrypted" in req.socket && req.socket.encrypted;
    const getFirstForwardedValue = (multiValueHeader) => {
      return multiValueHeader?.toString()?.split(",").map((e) => e.trim())?.[0];
    };
    const forwardedProtocol = getFirstForwardedValue(req.headers["x-forwarded-proto"]);
    const protocol = forwardedProtocol ?? (isEncrypted ? "https" : "http");
    const forwardedHostname = getFirstForwardedValue(req.headers["x-forwarded-host"]);
    const hostname = forwardedHostname ?? req.headers.host ?? req.headers[":authority"];
    const port = getFirstForwardedValue(req.headers["x-forwarded-port"]);
    const portInHostname = typeof hostname === "string" && /:\d+$/.test(hostname);
    const hostnamePort = portInHostname ? hostname : `${hostname}${port ? `:${port}` : ""}`;
    const url = `${protocol}://${hostnamePort}${req.url}`;
    const options = {
      method: req.method || "GET",
      headers: makeRequestHeaders(req)
    };
    const bodyAllowed = options.method !== "HEAD" && options.method !== "GET" && skipBody === false;
    if (bodyAllowed) {
      Object.assign(options, makeRequestBody(req));
    }
    const request = new Request(url, options);
    const forwardedClientIp = getFirstForwardedValue(req.headers["x-forwarded-for"]);
    const clientIp = forwardedClientIp || req.socket?.remoteAddress;
    if (clientIp) {
      Reflect.set(request, clientAddressSymbol, clientIp);
    }
    return request;
  }
  /**
   * Streams a web-standard Response into a NodeJS Server Response.
   * ```js
   * import { NodeApp } from 'astro/app/node';
   * import { createServer } from 'node:http';
   *
   * const server = createServer(async (req, res) => {
   *     const request = NodeApp.createRequest(req);
   *     const response = await app.render(request);
   *     await NodeApp.writeResponse(response, res);
   * })
   * ```
   * @param source WhatWG Response
   * @param destination NodeJS ServerResponse
   */
  static async writeResponse(source, destination) {
    const { status, headers, body, statusText } = source;
    if (!(destination instanceof Http2ServerResponse)) {
      destination.statusMessage = statusText;
    }
    destination.writeHead(status, createOutgoingHttpHeaders(headers));
    if (!body) return destination.end();
    try {
      const reader = body.getReader();
      destination.on("close", () => {
        reader.cancel().catch((err) => {
          console.error(
            `There was an uncaught error in the middle of the stream while rendering ${destination.req.url}.`,
            err
          );
        });
      });
      let result = await reader.read();
      while (!result.done) {
        destination.write(result.value);
        result = await reader.read();
      }
      destination.end();
    } catch (err) {
      destination.write("Internal server error", () => {
        err instanceof Error ? destination.destroy(err) : destination.destroy();
      });
    }
  }
}
function makeRequestHeaders(req) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === void 0) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(name, item);
      }
    } else {
      headers.append(name, value);
    }
  }
  return headers;
}
function makeRequestBody(req) {
  if (req.body !== void 0) {
    if (typeof req.body === "string" && req.body.length > 0) {
      return { body: Buffer.from(req.body) };
    }
    if (typeof req.body === "object" && req.body !== null && Object.keys(req.body).length > 0) {
      return { body: Buffer.from(JSON.stringify(req.body)) };
    }
    if (typeof req.body === "object" && req.body !== null && typeof req.body[Symbol.asyncIterator] !== "undefined") {
      return asyncIterableToBodyProps(req.body);
    }
  }
  return asyncIterableToBodyProps(req);
}
function asyncIterableToBodyProps(iterable) {
  return {
    // Node uses undici for the Request implementation. Undici accepts
    // a non-standard async iterable for the body.
    // @ts-expect-error
    body: iterable,
    // The duplex property is required when using a ReadableStream or async
    // iterable for the body. The type definitions do not include the duplex
    // property because they are not up-to-date.
    duplex: "half"
  };
}

nodePath.posix.join;

/**
 * The edge function calls the node server at /_render,
 * with the original path as the value of this header.
 */
const ASTRO_PATH_HEADER = 'x-astro-path';
const ASTRO_PATH_PARAM = 'x_astro_path';
/**
 * The edge function calls the node server at /_render,
 * with the locals serialized into this header.
 */
const ASTRO_LOCALS_HEADER = 'x-astro-locals';
const ASTRO_MIDDLEWARE_SECRET_HEADER = 'x-astro-middleware-secret';

// Run polyfills immediately so any dependent code can use the globals
apply();
// Won't throw if the virtual module is not available because it's not supported in
// the users's astro version or if astro:env is not enabled in the project
await import('./astro/env-setup_Cr6XTFvb.mjs')
    .then((mod) => mod.setGetEnv((key) => process.env[key]))
    .catch(() => { });
const createExports = (manifest, { middlewareSecret, skewProtection }) => {
    const app = new NodeApp(manifest);
    const handler = async (req, res) => {
        const url = new URL(`https://example.com${req.url}`);
        const clientAddress = req.headers['x-forwarded-for'];
        const localsHeader = req.headers[ASTRO_LOCALS_HEADER];
        const middlewareSecretHeader = req.headers[ASTRO_MIDDLEWARE_SECRET_HEADER];
        const realPath = req.headers[ASTRO_PATH_HEADER] ?? url.searchParams.get(ASTRO_PATH_PARAM);
        if (typeof realPath === 'string') {
            req.url = realPath;
        }
        let locals = {};
        if (localsHeader) {
            if (middlewareSecretHeader !== middlewareSecret) {
                res.statusCode = 403;
                res.end('Forbidden');
                return;
            }
            locals =
                typeof localsHeader === 'string' ? JSON.parse(localsHeader) : JSON.parse(localsHeader[0]);
        }
        // hide the secret from the rest of user code
        delete req.headers[ASTRO_MIDDLEWARE_SECRET_HEADER];
        // https://vercel.com/docs/deployments/skew-protection#supported-frameworks
        if (skewProtection && process.env.VERCEL_SKEW_PROTECTION_ENABLED === '1') {
            req.headers['x-deployment-id'] = process.env.VERCEL_DEPLOYMENT_ID;
        }
        const webResponse = await app.render(req, { addCookieHeader: true, clientAddress, locals });
        await NodeApp.writeResponse(webResponse, res);
    };
    return { default: handler };
};
// HACK: prevent warning
// @astrojs-ssr-virtual-entry (22:23) "start" is not exported by "dist/serverless/entrypoint.js", imported by "@astrojs-ssr-virtual-entry".
function start() { }

export { createExports as c, start as s };
