export {BaseController} from './controllers';

import {
    HTTPService,
    EventService,
    TranslatorService,
    AuthService,
    ErrorService,
    LoadingService,
    // PageCreator, // TODO :: PageCreator
} from './services';

export {Translation} from './services';

import {RouterService} from './routerService';

import {StoreService} from './storeService';

export const authService: AuthService;
export const routerService: RouterService;
export const storeService: StoreService;
export const errorService: ErrorService;
export const loadingService: LoadingService;
export const httpService: HTTPService;
export const eventService: EventService;
// export const pageCreator: PageCreator;
export const translatorService: TranslatorService;

export {HTTPService, EventService, TranslatorService, AuthService, ErrorService, LoadingService, PageCreatorService};
