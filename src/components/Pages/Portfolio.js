import React, { useState } from "react";
import "../css/Dropdown.css";
import api from "../../services/api";
import { CircleSlider } from "react-circle-slider";

const Portfolio = () => {
  const [renderPartial, setRenderPartial] = useState(false);

  let periodo = "";
  let latitude;
  let longitude;
  let value = 1;

  function setPeriodo(param) {
    periodo = param;
    console.log(periodo);
    if (periodo !== "semanal" && periodo !== "tudo") {
      setRenderPartial(true);
    } else {
      setRenderPartial(false);
    }
    var today = new Date();
    var month =
      today.getMonth() >= 10 ? "" + today.getMonth() : "0" + today.getMonth();
    var day =
      today.getDate() >= 10 ? "" + today.getDate() : "0" + today.getDate();
    var date = "" + today.getFullYear() + month + day;
    console.log(date);
    navigator.geolocation.getCurrentPosition(function (position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      console.log("Latitude is :", position.coords.latitude);
      console.log("Longitude is :", position.coords.longitude);
    });
  }

  function handleChange() {}

  return (
    <div className="container">
      <label className="dropdown" for="menu">
        Temporalidade
      </label>
      <input type="checkbox" id="menu"></input>
      <ul id="drop">
        <li onClick={() => setPeriodo("semanal")}>
          <a>Semanal</a>
        </li>
        <li onClick={() => setPeriodo("mensal")}>
          <a>Mensal</a>
        </li>
        <li onClick={() => setPeriodo("tudo")}>
          <a>Tudo</a>
        </li>
      </ul>
      {renderPartial && <CircleSlider value={value} />}
    </div>
  );
};

export default Portfolio;
