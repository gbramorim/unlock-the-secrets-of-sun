import React from "react";
import { Route, BrowserRouter } from "react-router-dom";

import Home from "./Home/Home";
import Sun from "./Sun/Sun";

const Routes = () => {
  return (
    <BrowserRouter>
      <Route component={Home} path="/" exact />
      <Route component={Sun} path="/sun" />
    </BrowserRouter>
  );
};

export default Routes;