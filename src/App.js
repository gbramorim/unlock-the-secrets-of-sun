import "./App.css";
import HamburgerMenu from "./components/HamburgerMenu";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./components/Pages/Home";
import About from "./components/Pages/About";
import Portfolio from "./components/Pages/Portfolio";
import MapGps from "./components/Pages/MapGps"
import Contact from "./components/Pages/Contact";
import api from "./services/api";

function App() {
  return (
    <>
      <Router>
        <HamburgerMenu />
        <div className="pages">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/statistics" component={Portfolio} />
            <Route path="/map" component={MapGps} />
            <Route path="/contact" component={Contact} />
          </Switch>
        </div>
      </Router>
    </>
  );
}

export default App;
