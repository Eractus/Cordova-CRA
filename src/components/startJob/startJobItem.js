import React, { Component } from "react";
import _ from "lodash";

export default class StartJobItem extends Component {
  render = () => {
    return (
      <div className="start-job-item-inputs-container">
        {Object.keys(this.props.inputValues).map((inputType, idx) => {
          let type = _.capitalize(inputType.slice(0, inputType.length - 6));
          return (
            <Input
              key={idx}
              type={type}
              inputType={inputType}
              inputValue={this.props.inputValues[inputType]}
              jobNum={this.props.jobNum}
              update={this.props.update}
              toggleCamera={this.props.toggleCamera}
            />
          );
        })}
      </div>
    );
  };
}

const Input = props => {
  const cameraIcon =
    props.inputType !== "partCount" ? (
      <img
        onClick={props.toggleCamera}
        value={props.type}
        src="./assets/camera.png"
        alt="camera"
      />
    ) : (
      ""
    );

  const inputName =
    props.inputType !== "partCount" ? (
      <p>{props.type} Number</p>
    ) : (
      <p>Part Count</p>
    );

  const type = props.inputType !== "partCount" ? "text" : "number";

  const update = e => {
    props.update(props.inputType, props.jobNum, e.currentTarget.value);
  };

  return (
    <div className="start-job-item-input-container">
      {inputName}
      <span className="start-job-item-input">
        <input type={type} value={props.inputValue} onChange={update} />
        {cameraIcon}
      </span>
    </div>
  );
};
