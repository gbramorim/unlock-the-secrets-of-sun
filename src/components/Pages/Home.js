import React, { useEffect, useState } from "react";
import DaylightSun from "../../assets/daylightsun.png";
import NightSun from "../../assets/nightsun.png";

import "../css/Home.css";

const Home = () => {
  const [sun, setSun] = useState(DaylightSun);
  const [wheter, setWheter] = useState(false);

  function getHourOfDay() {
    let newDate = new Date();
    let hour = `${newDate.getHours()}`;

    const daylight = hour > 0 && hour < 18;
    const night = hour > 18 && hour < 0;

    if (daylight) {
      setWheter(false);
      setSun(DaylightSun);
      document.body.style.background = "#33A2FF";
    }
    if (night) {
      setWheter(true);
      setSun(NightSun);
      document.body.style.background = "#242C4C";
    }

    return wheter;
  }

  useEffect(() => {
    getHourOfDay();
  });

  if (wheter === false) {
    return (
      <div className="home-principal">
        <h2>Solar Science</h2>
        <img className="img-home" src={sun} alt="#" />
        <h3>Solar Irradiance</h3>
        <h3 style={{ fontSize: "5rem" }}>10%</h3>
      </div>
    );
  } else if (wheter === true) {
    return (
      <div className="home-principal">
        <h2>Solar Science</h2>
        <img className="img-home" src={sun} alt="#" />
        <h3>blablabla radiação</h3>
        <h3 style={{ fontSize: "5rem" }}>10%</h3>
      </div>
    );
  }
};

export default Home;
