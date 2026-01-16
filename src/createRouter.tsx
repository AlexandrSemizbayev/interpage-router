import Router from "./Global";
import { type FC } from "react";
import { type TNestedRoute } from "./routeBuilder";
export const createRouter = (paths: TNestedRoute, SuspenseComponent: FC  = () => <div>Loading</div>) => {
  return () => <Router paths={paths} SuspenseComponent={SuspenseComponent} />;
}