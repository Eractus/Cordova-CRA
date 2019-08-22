import React from "react";

const Profile = props => {
  const profileMenus = [
    "Notifications",
    "Settings",
    "Help/Support",
    "Log Out"
  ]
  return (
    <div className="profile-container">
      <header className="profile-user">
        <img src="./assets/machine.png" alt="Profile"/>
        <p>{props.user.first_name} {props.user.last_name}</p>
      </header>
      <div className="profile-menus-container">
      {profileMenus.map((menu, idx) => {
        let val = menu;
        if (menu === "Help/Support") {
          val = "Support";
        } else if (menu === "Log Out") {
          val = "Logout";
        }
        const className = `profile-menu-icon ${val}`;
        return (
          <div
            key={idx}
            className="profile-menu-container"
            onClick={props.selectProfile(menu)}
          >
            <span className={className} />
            <p>{menu}</p>
          </div>
        );
      })}
      </div>
    </div>
  )
}

export default Profile;
