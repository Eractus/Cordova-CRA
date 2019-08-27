import React from "react";
import Timer from "./timer";

const CollapseInput = props => {
  const hasTimer = props.hasTimer ? (
    <Timer dndTimerType={props.inputName} notificationTimer={true} />
  ) : (
    ""
  );
  const hasLinks = props.hasLinks ? (
    <div className="settings-link-container">
      <a
        className="settings-link"
        href={props.link}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.link}
      </a>
      <span className="profile-item-input-separator" />
    </div>
  ) : (
    ""
  );

  return (
    <div className="collapse-input-container">
      <div>
        <div
          className="collapse-input-clickable"
          onClick={props.toggleInput(props.inputName)}
        >
          <p>{props.inputName}</p>
          <span
            className="collapse-input-arrow"
            style={{ transform: props.collapseInput ? "rotate(90deg)" : "" }}
          >
            &rsaquo;
          </span>
        </div>
      </div>
      <span className="profile-item-input-separator" />
      <section style={{ display: props.collapseInput ? "initial" : "none" }}>
        {hasTimer}
        {hasLinks}
      </section>
    </div>
  );
};

export default CollapseInput;
