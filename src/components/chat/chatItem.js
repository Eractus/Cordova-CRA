import React, { Component } from "react";

export default class ChatItem extends Component {
  state = {
    message: "",
    focusedMessageInput: false
  };

  // converts Date.now() milliseconds into the time, in the appropriate measurement, since the message was sent
  timeConversion = millisec => {
    const seconds = (millisec / 1000).toFixed(0);
    const minutes = (millisec / (1000 * 60)).toFixed(0);
    const hours = (millisec / (1000 * 60 * 60)).toFixed(0);
    const days = (millisec / (1000 * 60 * 60 * 24)).toFixed(0);
    if (seconds < 60) {
      return seconds + " sec";
    } else if (minutes < 60) {
      const mins = parseInt(minutes) === 1 ? " min" : " mins";
      return minutes + mins;
    } else if (hours < 24) {
      const hrs = parseInt(hours) === 1 ? " hr" : " hrs";
      return hours + hrs;
    } else {
      const ds = parseInt(days) === 1 ? " day" : " days";
      return days + ds;
    }
  };

  update = e => {
    this.setState({ message: e.currentTarget.value });
  };

  handleSubmit = e => {
    e.preventDefault();

    if (this.state.message.trim() !== "") {
      this.checkChatInitialTime();
      this.props.sendNewMessage(
        this.props.displayChat[0],
        this.props.displayChat[1],
        this.state.message
      );
      this.setState({ message: "" });
    }
  };

  sendRecommendationAsMessage = recom => {
    return () => {
      this.checkChatInitialTime();
      this.props.sendNewMessage(
        this.props.displayChat[0],
        this.props.displayChat[1],
        recom
      );
    };
  };

  checkChatInitialTime = () => {
    if (!this.props.chats[this.props.displayChat[0]][this.props.displayChat[1]].chatHistory.chatFirstBegan) {
      let currentTime = new Date();
      let hour = currentTime.getHours();
      let mins = currentTime.getMinutes();
      mins = mins < 10 ? `0${mins}` : mins;
      let amPM = hour >= 12 ? "pm" : "am";
      hour = hour === 0 ? 12 : hour;
      hour = hour > 12 ? hour - 12 : hour;
      currentTime = `${hour}:${mins} ${amPM}`;
      this.props.setInitialTime(this.props.displayChat[0], this.props.displayChat[1], currentTime)
    }
  }

  // using setTimeout with 0.15 of a second to allow enough time for the on blur effect to kick in after user has a chance to actually click a recommendation
  toggleRecommendations = type => {
    return () => {
      this.setState({ focusedMessageInput: !this.state.focusedMessageInput });
      const timer = type === "focus" ? 0 : 150;
      let displayStyle, marginBottom;
      if (type === "focus") {
        displayStyle = "flex";
        marginBottom = "85px"
      } else if (type === "blur") {
        displayStyle = "none";
        marginBottom = "40px"
      }
      setTimeout(() => {
        document.getElementById("recommendations").style.display = displayStyle
        document.getElementById("messages").style.marginBottom = marginBottom
      }, timer);
    }
  }

  render = () => {
    const chatItem = this.props.chats[this.props.displayChat[0]][
      this.props.displayChat[1]
    ];

    return (
      <div className="chat-item-container">
        <h5>{chatItem.chatHistory.chatFirstBegan}</h5>
        <section id="messages" className="chat-item-messages-container">
          {chatItem.chatHistory.chatLog.map((chat, idx) => {
            const machImg =
              chat[0] === "machine" ? (
                <img src="./assets/machine.png" alt="MachIcon" />
              ) : (
                ""
              );

            const bubbleArrow =
              chat[0] === "machine" ? <span>&#9664;</span> : "";

            let timeAgo = Date.now() - chat[2];
            timeAgo = this.timeConversion(timeAgo);
            const userMsgTime =
              chat[0] === "user" ? (
                <div className="chat-item-time">
                  <span>&#10003;</span>
                  <p>{timeAgo} ago</p>
                </div>
              ) : (
                ""
              );

            const className =
              chat[0] === "machine"
                ? "chat-item-bubble machine"
                : "chat-item-bubble user";

            return (
              <div key={idx} className="chat-item-message-container">
                <div className="chat-item-message">
                  {machImg}
                  <div className={className}>
                    {bubbleArrow}
                    <p>{chat[1]}</p>
                  </div>
                </div>
                {userMsgTime}
              </div>
            );
          })}
        </section>
        <div className="chat-item-message-submit-overlay" style={{display: this.state.focusedMessageInput ? "block" : "none"}} />
        <form className="chat-item-message-submit" onSubmit={this.handleSubmit}>
          <div id="recommendations" className="chat-item-message-submit-recommendations">
            {Object.keys(chatItem.responses).map((recom, idx) => (
              <p key={idx} onClick={this.sendRecommendationAsMessage(recom)}>
                {recom}
              </p>
            ))}
          </div>
          <div className="chat-item-message-submit-inputs">
            <input
              type="text"
              placeholder="Your Message"
              value={this.state.message}
              onChange={this.update}
              onFocus={this.toggleRecommendations("focus")}
              onBlur={this.toggleRecommendations("blur")}
            />
            <input
              className="chat-item-message-submit-button"
              type="submit"
              value="SEND"
            />
          </div>
        </form>
      </div>
    );
  };
}
