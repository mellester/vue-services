/**
 * @typedef {import("vue-router").RouteRecord} RouteRecord
 * @typedef {import("vue-router").NavigationGuard} NavigationGuard
 * @typedef {import("vue-router").NavigationHookAfter} NavigationHookAfter
 * @typedef {import('vue-router').RouteLocation} RouteLocation
 * @typedef {import('vue-router').LocationQuery} LocationQuery
 *
 * @typedef {import("./factory").RouteFactory} RouteFactory
 * @typedef {import("./settings").RouteSettings} RouteSettings
 */
import {RouterConsumedError} from '../../errors/RouterConsumedError';

import {createRouter, createWebHistory} from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [],
});

/**
 * checks if the given string is in the current routes name
 * @param {string} pageName the name of the page to check
 */
const onPage = pageName => router.currentRoute.value.name.includes(pageName);

export class RouterService {
    /**
     * @param {RouteFactory} factory the router factory
     * @param {RouteSettings} settings the settings service for the routes
     */
    constructor(factory, settings) {
        this._router = router;
        this._factory = factory;
        this._settings = settings;

        /** @type {NavigationGuard[]} */
        this._routerBeforeMiddleware = [this.beforeMiddleware];
        router.beforeEach((to, from, next) => {
            for (const middlewareFunc of this._routerBeforeMiddleware) {
                // MiddlewareFunc will return true if it encountered problems
                if (middlewareFunc(to, from, next)) return next(false);
            }
            return next();
        });

        /** @type {NavigationHookAfter[]} */
        this._routerAfterMiddleware = [];
        router.afterEach((to, from) => {
            for (const middlewareFunc of this._routerAfterMiddleware) {
                middlewareFunc(to, from);
            }
        });
    }

    /** router can only be consumed once, which will happen at the appstarter */
    get router() {
        if (!this._router) {
            throw new RouterConsumedError('You may not acces the router directly!');
        }
        const onceRouter = this._router;
        this._router = undefined;
        return onceRouter;
    }

    /**
     * register middleware for the router before entering the route
     * @param {BeforeMiddleware} middlewareFunc the middleware function
     */
    registerBeforeMiddleware(middlewareFunc) {
        this._routerBeforeMiddleware.push(middlewareFunc);
    }

    /**
     * register middleware for the router after entering a route
     * @param {AfterMiddleware} middlewareFunc the middleware function
     */
    registerAfterMiddleware(middlewareFunc) {
        this._routerAfterMiddleware.push(middlewareFunc);
    }

    // prettier-ignore
    /**
     * Add routes to the router
     * @param {RouteRecord[]} routes
     */
    addRoutes(routes) {router.options.routes.push(routes);}

    /**
     * Go to the give route by name, optional id and query
     * If going to a route you are already on, it catches the given error
     *
     * @param {String} name the name of the new route
     * @param {String} [id] the optional id for the params of the new route
     * @param {LocationQuery} [query] the optional query for the new route
     */
    goToRoute(name, id, query) {
        if (onPage(name) && !query && !id) return;

        /** @type {RouteLocation} */
        const route = {name};
        if (id) route.params = {id};
        if (query) route.query = query;

        router.push(route).catch(err => {
            // TODO :: vue-3 :: check if NavigationDuplicated error is still the same name
            // Ignore the vue-router err regarding navigating to the page they are already on.
            if (err && err.name != 'NavigationDuplicated') {
                // But print any other errors to the console
                console.error(err);
            }
        });
    }

    /**
     * create basic routes for the given settings
     *
     * @param {RouteSettings} settings the settings on which the routes are based
     */
    createRoutes(settings) {
        const routes = [];

        if (settings.overviewComponent) {
            routes.push(this._factory.createOverview(settings));
        }

        if (settings.createComponent) {
            routes.push(this._factory.createCreate(settings));
        }

        if (settings.showComponent) {
            routes.push(this._factory.createShow(settings));
        }

        if (settings.editComponent) {
            routes.push(this._factory.createEdit(settings));
        }

        return [this._factory.createBase(settings, routes)];
    }

    /**
     * Create new route settings
     *
     * @param {String} baseRouteName the base name for the routes being created
     *
     * @returns {RouteSettings}
     */
    newSettings(baseRouteName) {
        return this._settings.createNew(baseRouteName);
    }

    /** @returns {NavigationGuard} */
    get beforeMiddleware() {
        return (to, from) => {
            const fromQuery = from.query.from;
            if (fromQuery) {
                if (fromQuery == to.fullPath) return false;
                router.push(from.query.from);
                return true;
            }
            return false;
        };
    }

    // prettier-ignore
    /** returns if you are on the create page */
    get onCreatePage() { return onPage(this._settings.createPageName); }
    // prettier-ignore
    /** returns if you are on the edit page */
    get onEditPage() { return onPage(this._settings.editPageName); }
    // prettier-ignore
    /** returns if you are on the show page */
    get onShowPage() { return onPage(this._settings.showPageName); }
    // prettier-ignore
    /** returns if you are on the overview page */
    get onOverviewPage() { return onPage(this._settings.overviewPageName); }
    // prettier-ignore
    /** Get the query from the current route */
    get query() { return router.currentRoute.query; }
    // prettier-ignore
    /** Get the id from the params from the current route */
    get id() { return router.currentRoute.params.id; }

    // prettier-ignore
    /** Get the name from the current route */
    get currentRouteName() { return router.currentRoute.name; }
}
