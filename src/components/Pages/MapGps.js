import React from "react";
import Leaflet from "../../assets/leaflet.png";

const MapGps = () => {
  let latitude;
  let longitude;

  navigator.geolocation.getCurrentPosition(function (position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
  });

  return (
    <div style={{ marginTop: 100 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginLeft: 50,
          marginTop: 50,
          color: "white",
        }}
      >
        <h2>Latitude is: -8.1019096</h2>
        <h2>Longitude is: -34.8953579</h2>
      </div>
      <img
        style={{ height: 300, padding: 15, borderRadius: 35 }}
        src={Leaflet}
        alt="Maps"
      />
      <h2
        style={{
          display: "flex",
          justifyContent: "center",
          marginLeft: 20,
          color: "white",
        }}
      >
        Actual Position
      </h2>
    </div>
  );
};

export default MapGps;
