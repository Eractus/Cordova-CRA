import React, { Component } from "react";
// import CollapseInput from "./collapseInput";

export default class Notifications extends Component {
  state = {
    showFromTimer: false,
    showToTimer: false
  };

  toggleTimer = type => {
    return () => {
      const key = `show${type}Timer`;
      this.setState({ [key]: !this.state[key] });
    }
  }

  render = () => {
    return (
      <div className="notifications-container">
        {Object.keys(this.props.user.notifications).map((notif, idx) => {
          const notifications = this.props.user.notifications;
          // if it's for text/email notification, more straightforward ToggleInput functional component
          if (notif !== "Do Not Disturb") {
            return (
              <ToggleInput
                key={idx}
                notification={notif}
                toggled={notifications[notif]}
                toggleNotification={this.props.toggleNotification}
              />
            );
          // } else {
            // if it's for do not disturb, there's a more elaborate JSX layout on top of a ToggleInput functional component, including two CollapseInput functional components.

          }
        })}
      </div>
    );
  };
}

// this block goes into line 34 when we want to activate Do Not Disturb again
// return (
//   <div key={idx} className="notifications-do-not-disturb-container">
//     <p>{notif}</p>
//     <ToggleInput
//       notification="Scheduled"
//       toggled={notifications[notif].on}
//       toggleNotification={this.props.toggleNotification}
//     />
//     <div style={{display: notifications[notif].on ? "initial" : "none"}}>
//     {Object.keys(notifications[notif]).map((dndField, idx) => {
//       if (dndField !== "on") {
//         const showTimer = dndField === "From" ? this.state.showFromTimer : this.state.showToTimer;
//         return (
//           <CollapseInput
//             key={idx}
//             inputName={dndField}
//             collapseInput={showTimer}
//             toggleInput={this.toggleTimer}
//             hasTimer={true}
//           />
//         );
//       }
//     })}
//     </div>
//   </div>
// );

const ToggleInput = props => {
  // various class name and other values change based on App component's current state value for notification and other related pointers
  const inputName =
    props.notification === "Scheduled"
      ? "Scheduled"
      : `${props.notification} Notifications`;
  const sliderClassName = props.toggled
    ? "toggle-input-slider toggled"
    : "toggle-input-slider";
  const circleClassName = props.toggled
    ? "toggle-input-circle toggled"
    : "toggle-input-circle";
  const toggleArg =
    props.notification === "Scheduled" ? "Do Not Disturb" : props.notification;
  return (
    <div className="toggle-input-container">
      <div>
        <p>{inputName}</p>
        <div
          className={sliderClassName}
          onClick={props.toggleNotification(toggleArg)}
        >
          <span className={circleClassName} />
        </div>
      </div>
      <span className="profile-item-input-separator" />
    </div>
  );
};
