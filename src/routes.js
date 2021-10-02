import React from "react";
import { Route, BrowserRouter } from "react-router-dom";

import Init from "./Init/Init";
import Home from "./Home/Home";
import Sun from "./Sun/Sun";

const Routes = () => {
    return (
        <BrowserRouter>
            <Route component={Init} path="/" exact />
            <Route component={Home} path="/home" />
            <Route component={Sun} path="/sun" />
        </BrowserRouter>
    );
};

export default Routes;