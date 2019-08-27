import React from "react";

const Logout = props => {
  const logOut = () => {
    localStorage.removeItem("Mata Inventive");
    window.location.reload();
  };

  return (
    <div className="logout-container">
      <img src="./assets/logoutIllustration.png" alt="Logout Illustration" />
      <p>Are You Sure You Want To Log Out?</p>
      <div className="logout-buttons-container">
        <button className="form-submit-button" onClick={logOut}>
          Leave
        </button>
        <button className="form-submit-button grey" onClick={props.hideProfile}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Logout;
