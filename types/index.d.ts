// The same as ./src/index.js
export {startApp} from './starter';

export {moduleFactory, MinimalRouterView} from './module';

export {login, isLoggedIn, logout} from './services/auth';

// export {createToastMessage, createModal} from './services/event';

export {BaseFormError} from './services/error';

export {getRequest, postRequest, download} from './services/http';

export {addRoute, goToRoute, getCurrentRouteQuery, getCurrentRouteModuleName} from './services/router';

export {getAllFromStore} from './services/store';

export {
    getPluralTranslation,
    getCapitalizedPluralTranslation,
    getCapitalizedSingularTranslation,
    getSingularTranslation,
} from './services/translator';
