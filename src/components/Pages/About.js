import React from "react";
import Avatar from "../../assets/avatar.png";
import "../css/Profile.css";

const About = () => {
  return (
    <>
      <div className="profile-principal">
        <img src={Avatar} alt="Avatar" />
        <div className="profile-inputs">
          <span>Name</span>
          <input type="text" placeholder=" XXXX" />
        </div>
        <div className="profile-inputs">
          <span>Road, Number</span>
          <input type="text" placeholder=" XXXX" />
        </div>
        <div className="profile-inputs">
          <span>City</span>
          <input type="text" placeholder=" XXXX" />
        </div>
        <div className="profile-inputs">
          <span>State</span>
          <input type="text" placeholder=" XXXX" />
        </div>
        <button class="pure-material-button-contained">Save changes</button>
      </div>
    </>
  );
};

export default About;
