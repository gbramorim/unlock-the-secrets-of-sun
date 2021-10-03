import React from "react";
import '../css/Dropdown.css'
import api from "../../services/api";

const Portfolio = () => {
  let periodo = ""
  let ano
  let date
  let latitude
  let longitude
  let value = 1

  function setPeriodo(param) {
    periodo = param
    console.log(periodo)
    var today = new Date();
    var month = today.getMonth() >= 10 ? "" + today.getMonth() : "0" + today.getMonth();
    var day = today.getDate() >= 10 ? "" + today.getDate() : "0" + today.getDate();
    ano = today.getFullYear()
    date = "" + ano + month + day;
    console.log(date)
    navigator.geolocation.getCurrentPosition(function(position) {
      latitude = position.coords.latitude
      longitude = position.coords.longitude
      console.log("Latitude is :", position.coords.latitude);
      console.log("Longitude is :", position.coords.longitude);
    });
  }

  function getValores() {
    api.get('/disponibilidadesol', {
      params: {
        latitude: latitude,
        longitude: longitude,
        periodo: periodo,
        end: date,
        mes_desejado: '05',
      }
    }).then((response) => {
      console.log(response)
    })
  }

  return (
    <>
    <body>
      <div class="container">
      <label class="dropdown" for="menu">Temporalidade</label>
      <input type="checkbox" id="menu"></input>
      <ul id="drop">
        <li onClick={() => setPeriodo("semanal")}><a>Semanal</a></li>
        <li onClick={() => setPeriodo("mensal")}><a>Mensal</a></li>
        <li onClick={() => setPeriodo("tudo")}><a>Tudo</a></li>
      </ul>
      <button onClick={() => getValores()}class="pure-material-button-contained">Submit</button>
      </div>
    </body>
    </>
  );
};

export default Portfolio;