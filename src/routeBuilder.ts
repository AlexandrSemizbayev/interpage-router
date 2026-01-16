type Awaitable<T> = Promise<T> | T;
// export type RouteWithProps<P> = IRouteParams<P> & { props: P };
export interface IRouteParams<PROPS={}, PARAMS = {}> {
  path: string;
  params?: PARAMS;
  query?: Record<string, any>;
  isErrorPage?: boolean;
  fallbackFor?: string;
  component?: React.LazyExoticComponent<any>;
  props?: PROPS;
  beforeReroute?(this: IRouteParams<PROPS,PARAMS>): IRouteParams<PROPS,PARAMS> | Awaitable<IRouteParams<PROPS, PARAMS>>;
}

export interface RouteWithProps<PROPS, PARAMS> extends IRouteParams<PROPS, PARAMS> {
  props: PROPS;
}

export type TNestedRoute = {[k: string]: any } & {
  generic?: TNestedRoute & { key: string };
  routeParams?: IRouteParams;
};


const generateEmptyRoute: () => IRouteParams = () => ({
  path: "",
  params: {} as Record<string, any>,
  query: {} as Record<string, any>,
  isErrorPage: false,
  props: {
    callbacks: {},
  },
});

export const createRoute: (routeData: IRouteParams) => IRouteParams = (routeData) => {
  const emptyRoute = {
    ...generateEmptyRoute(),
  };
  const newRoute = {
    ...emptyRoute,
    path: routeData.path ?? {},
    query: routeData.query ?? {},
    params: routeData.params ?? {},
    isErrorPage: routeData.isErrorPage ?? false,
    fallbackFor: routeData.fallbackFor,
    props: {
      ...routeData.props,
      ...emptyRoute.props,
      // callbacks: routeData.props?.callbacks ?? {},
    },
    component: routeData.component,
    beforeReroute: routeData.beforeReroute || function() { return this },
  };
  return newRoute;
};

export const generateRouteNestedList = (mask: string,routeParams: IRouteParams) => {
  const root = {} as TNestedRoute;
  if(routeParams.isErrorPage) {
    root['/fallback'] = {};
    root['/fallback'].routeParams = routeParams;
    return root;
  }
  let currentNode = root;
  const splitted = mask.split('/').filter(part => part.length > 0);
  if(splitted.length === 0) {
    root['/'] = {};
    root['/'].routeParams = routeParams;
  }
  splitted.forEach((part, index) => {
    if(part.startsWith(':')) {
      currentNode.generic = {
        key: part.slice(1),
      };
      currentNode = currentNode.generic;
    } else {
      currentNode[`/${part}`] = {};
      currentNode = currentNode[`/${part}`];
    }
    if(index === splitted.length - 1) {
      currentNode.routeParams = routeParams;
    }
  });
  return root
}


export function getNestedRoute(requestedURL: string, routes: TNestedRoute): IRouteParams | null {
  if(requestedURL === "/" && routes["/"]) {
    return routes["/"].routeParams;
  }
  const splitted = requestedURL.split('/').filter(part => part.length > 0);
  const params = {} as Record<string, string>;
  let currentNode = routes;
  for(const part of splitted) {
    if(currentNode[`/${part}`]) {
      currentNode = currentNode[ `/${part}`];
    } else if(currentNode.generic) {
      params[currentNode.generic.key] = part;
      currentNode = currentNode.generic;
    } else {
      const fallbackRoute = { ...routes['/fallback'] }?.routeParams || {};
      fallbackRoute.fallbackFor = requestedURL;
      return fallbackRoute;
    }
  }
  if(currentNode?.routeParams?.params) Object.assign(currentNode.routeParams.params, params);
  return currentNode?.routeParams ?? null;
}
