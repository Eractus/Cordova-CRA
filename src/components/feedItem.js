import React from "react";

const FeedItem = props => {
  const { name, utilization, timer, status } = props.machSpecs;

  return (
    <div
      className="feed-item"
      style={{ border: status === "Online" ? "2px solid #7ED321" : "2px solid #9B9B9B" }}
      onClick={props.toggleMachineSelection(props.machSpecs)}
    >
      <span
        className="feed-indicator-dot"
        style={{
          backgroundColor: status === "Online" ? "#7ED321" : "#9B9B9B"
        }}
      />
      <img src="./assets/machList.png" alt="PNG" />
      <div className="feed-item-text-wrapper">
        <p>
          {name}
        </p>
        <p
          style={{
            color:
              utilization >= 66 ? "#7ED321" : utilization <= 39 ? "#BB0000" : "orange"
          }}
        >
          {utilization}% Utilization
        </p>
        <p>
          {timer}
        </p>
      </div>
      <p>{status}</p>
    </div>
  );
};

export default FeedItem;
