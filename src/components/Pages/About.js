import React from "react";
import Avatar from "../../assets/avatar.png";
import "../css/Profile.css";

const About = () => {
  return (
    <>
      <div className="profile-principal">
        <img src={Avatar} alt="Avatar" />
      </div>
    </>
  );
};

export default About;
