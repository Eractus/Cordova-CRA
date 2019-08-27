import React from "react";
import Notifications from "../notifications";
import Settings from "../settings";
import Support from "../support";
import Logout from "../logout";

const ProfileItem = props => {
  //see where the props.toggleNotification is//parent is main.js
  let profileItem;
  switch (props.displayProfile) {
    case "Notifications":
      profileItem = (
        <Notifications
          user={props.user}
          toggleNotification={props.toggleNotification}
        />
      );
      break;
    case "Settings":
      profileItem = <Settings user={props.user} />;
      break;
    case "Help/Support":
      profileItem = <Support user={props.user} />;
      break;
    case "Log Out":
      profileItem = <Logout hideProfile={props.hideProfile} />;
      break;
    default:
      return "";
  }
  return <div className="profile-item-container">{profileItem}</div>;
};

export default ProfileItem;
