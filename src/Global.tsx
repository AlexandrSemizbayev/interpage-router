import { type FC, Suspense, type ComponentType } from "react";
import { useEffect, useState } from "react";
import Context from "./Context";
import { getNestedRoute } from "./routeBuilder";
const url = window.location.pathname+`${window.location.search || ''}`;

interface RouterProps {
  paths?: Record<string, any>;
  SuspenseComponent: FC;
}

const Router: FC<RouterProps> = ({ paths = {} as Record<string, any> , SuspenseComponent}) => {
  
  const [getURL, setURL] = useState<string>(url);
  const [Child, setChild] = useState<ComponentType<any> | null>(null);
  const [childProps, setChildProps] = useState({});

  useEffect(() => {
    (async() => {
      const url = new URL(getURL,window.location.origin);
      const search = url.search;
      const queries = {};
      if(search) {
        const searchParams = Object.fromEntries(new URLSearchParams(search));
        Object.assign(queries, searchParams);
      }
      history.pushState(null, "", getURL);
      const matchedRoute = getNestedRoute(url.pathname, paths);
      if(matchedRoute?.isErrorPage) {
        history.pushState(null, "", matchedRoute.path);
      }
      if(!matchedRoute?.query) { matchedRoute!.query = {}; }
      Object.assign(matchedRoute!.query, queries);
      const readyToMount = matchedRoute?.beforeReroute ? await matchedRoute.beforeReroute() : matchedRoute;
      const comp = readyToMount?.component || null;
      setChildProps(() => readyToMount?.props ?? {});
      setChild(() =>comp);
    })();
  }, [getURL]);
  useEffect(() => {
    const onPopState = () => {
      setURL(() => window.location.pathname+`${window.location.search || ''}`);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);
  return (
    <>
      <Context.Provider value={{ getURL, setURL }}>
        <Suspense fallback={<SuspenseComponent />}>
          {Child ? <Child {...childProps}/> : null}
        </Suspense>
      </Context.Provider>
    </>
  );
};

export default Router;
