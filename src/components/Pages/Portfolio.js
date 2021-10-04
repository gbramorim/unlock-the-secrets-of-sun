import React, { useState } from "react";
import "../css/Dropdown.css";
import api from "../../services/api";
import { CircleSlider } from "react-circle-slider";
import { Line } from "react-chartjs-2";
import { defaults } from 'react-chartjs-2'

defaults.color = "white"


const LineChart = (chave, valor) => {
  console.log("Logando chave", chave);
  return (
    <div>
      <Line
        data={{
          labels: chave.chave,
          datasets: [
            {
              label: "kW-hr/m²",
              data: chave.valor,
              backgroundColor: ["yellow"],
            },
          ],
        }}
        height={400}
        width={300}
        options={{
          legend: {
            labels: {
                // This more specific font property overrides the global property
                fontColor: 'white'
            }
          },
          borderColor: 'yellow',
          tension: 0,
          maintainAspectRatio: false,
          bezierCurve: false,
          scales: {
            yAxes: [
              {
                ticks: {
                  fontColor: "red",
                  beginAtZero: true,
                },
              },
            ],
          },
        }}
      />
    </div>
  );
};

const Portfolio = () => {
  let periodo = "";
  let ano;
  let date;
  let latitude;
  let longitude;
  let value = 1;
  let keys = [];
  let values = [];
  const [chave, setChave] = useState([]);
  const [valor, setValor] = useState([]);

  function setPeriodo(param) {
    periodo = param;
    // console.log(periodo);
    var today = new Date();
    var month =
      today.getMonth() >= 10 ? "" + today.getMonth() : "0" + today.getMonth();
    var day =
      today.getDate() >= 10 ? "" + today.getDate() : "0" + today.getDate();
    ano = today.getFullYear();
    date = "" + ano + month + day;
    // console.log(date)
    navigator.geolocation.getCurrentPosition(function (position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      // console.log("Latitude is :", position.coords.latitude);
      // console.log("Longitude is :", position.coords.longitude);
    });
  }

  function getValores() {
    api
      .get("/disponibilidadesol", {
        params: {
          latitude: latitude,
          longitude: longitude,
          periodo: periodo,
          end: date,
          mes_desejado: "05",
        },
      })
      .then((response) => {
        // console.log(response)
        keys = Object.keys(response.data);
        values = Object.values(response.data);
        setValor(values);
        setChave(keys);
        console.log(chave);
        console.log(valor);
      });
  }

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
      <button
        onClick={() => getValores()}
        class="pure-material-button-contained"
      >
        Submit
      </button>
      {/* {<CircleSlider value={value} />} */}

      <LineChart chave={chave} valor={valor} />
    </div>
  );
};

export default Portfolio;
