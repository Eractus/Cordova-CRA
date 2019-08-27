import React, { Component } from "react";
import _ from "lodash";

export default class Chat extends Component {
  state = {
    search: ""
  };

  update = e => {
    this.setState({ search: e.currentTarget.value });
  };

  handleSubmit = e => {
    e.preventDefault();

    this.setState({ search: "" });
  };

  render = () => {
    const chats = this.props.chats;
    let latestJobPartDate, filteredChatResult;
    if (this.state.search.trim() === "") {
      Object.keys(chats).forEach(chatType => {
        if (chatType !== "Machines") {
          Object.keys(chats[chatType]).forEach(chatName => {
            const chatObj = chats[chatType][chatName];
            const startTime = chatObj.responses["Start Time"];
            const editTime =
              chatType === "Parts"
                ? startTime.slice(startTime.length - 19, startTime.length)
                : startTime;
            if (!latestJobPartDate || editTime > latestJobPartDate) {
              latestJobPartDate = editTime;
              filteredChatResult = {
                Machines: this.props.chats.Machines,
                Parts: {},
                Jobs: {}
              };
            }
            if (editTime === latestJobPartDate) {
              filteredChatResult[chatType][chatName] = chatObj;
            }
          });
        }
      });
    } else {
      filteredChatResult = {
        Machines: {},
        Parts: {},
        Jobs: {}
      };
      Object.keys(chats).forEach(chatType => {
        Object.keys(chats[chatType]).forEach(chatName => {
          const searchString = _.lowerCase(this.state.search);
          if (_.lowerCase(chatName).includes(searchString)) {
            const chatObj = chats[chatType][chatName];
            filteredChatResult[chatType][chatName] = chatObj;
          }
        });
      });
    }

    return (
      <div className="chat-container">
        <div className="chat-header">
          <form className="chat-search" onSubmit={this.handleSubmit}>
            <img className="logo" src="./assets/search.png" alt="Search" />
            <input
              type="text"
              value={this.state.search}
              placeholder="Search"
              onChange={this.update}
            />
          </form>
        </div>
        {Object.keys(filteredChatResult).map((type, idx) => {
          const chats = filteredChatResult[type];
          return (
            <ChatGroup
              key={idx}
              type={type}
              chats={chats}
              selectChat={this.props.selectChat}
            />
          );
        })}
      </div>
    );
  };
}

const ChatGroup = props => {
  const chatGroupItems =
    Object.keys(props.chats).length === 0 ? (
      <p>No {_.lowerFirst(props.type)} for your searched value.</p>
    ) : (
      Object.keys(props.chats).map((chat, idx) => {
        const className = `chat-group-item-icon ${props.type}`;
        return (
          <div
            key={idx}
            className="chat-group-item"
            onClick={props.selectChat(props.type, chat)}
          >
            <span className={className} />
            <p>{chat}</p>
          </div>
        );
      })
    );

  return (
    <div className="chat-group-container">
      <h5>{props.type}</h5>
      {chatGroupItems}
    </div>
  );
};
