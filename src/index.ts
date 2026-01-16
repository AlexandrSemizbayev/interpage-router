import { useContext, type FC } from "react";
import { type IRouteParams,  type TNestedRoute, createRoute, generateRouteNestedList } from "./routeBuilder";
import { AppContext } from "./Context";
import { createRouter } from "./createRouter";
export type { IRouteParams, RouteWithProps } from "./routeBuilder";
import { joinObjects } from "./helpers/object";

export const init = (routes: IRouteParams[], SuspenseComponent?: FC) => {
  const paths: TNestedRoute = {};
  routes.map(createRoute).forEach((route) => {
    const nested = generateRouteNestedList(route.path, route);
    joinObjects(paths, nested);
  });
  return createRouter(paths, SuspenseComponent);
};
export function RouterContext() { return useContext(AppContext); }