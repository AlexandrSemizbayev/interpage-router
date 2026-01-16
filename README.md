# Interpage router for React

### Interpage router for React is a simple but very helpful tool, created during struggles with another router's solutions published in npm repository. What the author wanted, was just a simple routing, with ability to disable required layouts. Also, the goal was to create a router that doesn't require huge documentation. Simply go this way or that way.

<div align="center">
<img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3gya2d2Y3IweTJscmRid2NlcnR5dGg1MWJyZmFkd2NmajFvbzFiYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pQRNYhrLrO7bkS6P1Y/giphy.gif" alt="animated image with a pinguin choosing a way to go"/>
</div>

### So, here we are, the package you are looking at, can do things simple. Just initialize it and wrap your App with it!

```sh
  npm i interpage-router
```

## Example of usage

### App.(tsx||jsx)
```tsx
import "./styles.css";
import { init } from "./router";
import { lazy } from "react";

const routes = [
  {
    path: "/",  // This is the home page accessible at [host]:[port]/
    component: lazy(() => import("./pages")), // Using lazy loaded components we reduce the size of the bundle
    // params: { val: 0 }, // params are generated automatically, in case of match with path mask *
    beforeReroute() { // before reroute is called before mounting the page, can also be an async function
      console.log("Welcome to the home page!");
      return this;  // preffered return used in case of chaining 
    },
  },
  {
    path: "/user/:id/", // "/user/234/"
    params: {id: ''},
    props: {id: ''},  // Wait, what? Yes, we can pass props to our pages
    component: lazy(() => import("./pages/User/Info")),
    beforeReroute() {
      // automatically matched id was already assigned to this.params.id, in this case it is equal to "234"
      this.props.id = this.params.id; 
      return this;
    },
  },
  {
    path: "/user",
    params: {},
    props: {},
    component: lazy(() => import("./pages/User")),
    beforeReroute() {
      return this;
    },
  },
  {
    path: "/test-page/:zip/:id/",  // this line can be much longer than in this example...
    params: {id: '', zip: '', }, // the generated params for '/test-page/98055/12345/' will be following: **
    // { zip: "98055", id: "12345"}
    props: {
      todo: {}, // we will fill this prop with fetched data
    },
    component: lazy(() => import("./pages/Test")),
    async beforeReroute() {
      const self = this;
      Object.assign(this.props, this.params); // Oh, thats interesting case, since now we can pass props to our pages. Usecase scenario fetching data, and passing the result as props 
      return await fetch(`https://jsonplaceholder.typicode.com/todos/${this.params.id}`)
      .then(response => response.json()).then(data => {
        console.log(data);
        self.props.todo = data;
        return self;
      });
    },
  },
  {
    path: "/error", // Error page, used as a fallback, in case of non matching route, lets say /uuusers/1234
    params: {},
    props: {},
    fallbackFor: '', // this will be filled automatically with the non-matching route
    isErrorPage: true,  // That's exactly the pointer to let the package identify the error page
    component: lazy(() => import("./pages/Error")),
    beforeReroute() {
      console.log(this.fallbackFor) // "/uuusers/1234"
      // now you can send it to statistics or do whatever is needed
      return this;
    },
  },
]
const Router = init(routes);

export default function App() {
  return (
    <div className="App">
      <Router />
    </div>
  );
}

```
### ./pages/Error.(tsx||jsx)
```tsx
import { RouterContext } from "../../router";
import { type FC } from "react";
interface ITestProps {  // defining props Type
  id: number|string;
  zip: string;
  todo: Record<string, any>;
  
};
const Test: FC<ITestProps> = ({ id, zip, todo}) => {
  // setURL is used for redirects
  const { setURL } = RouterContext()!;  // available properties getURL and setURL
  return <>
    <div>Test Page</div>; 
    <h2>Your ID is {id}</h2>
    {JSON.stringify(todo)}  /* fetched todo is already passed from beforeReroute hook */
    <button onClick={() => {setURL("/")}}>
      navigate to '/'
    </button>
  </>
}

export default Test;
```
### route params typing
```ts
type Awaitable<T> = Promise<T> | T;
export interface IRouteParams<PROPS={}, PARAMS = {}> {
  path: string;
  params?: PARAMS;
  query?: Record<string, any>;  // Is not implemented or used yet, since queries are pretty much unstable and it is better to access them using window.location.search
  isErrorPage?: boolean;  // error page flag
  fallbackFor?: string; // in case of error page, this field will be filled with failed url
  component?: React.LazyExoticComponent<any>;
  props?: PROPS;
  beforeReroute?(this: IRouteParams<PROPS,PARAMS>): IRouteParams<PROPS,PARAMS> | Awaitable<IRouteParams<PROPS, PARAMS>>;
}

export interface RouteWithProps<PROPS, PARAMS> extends IRouteParams<PROPS, PARAMS> {
  props: PROPS;
}
```

