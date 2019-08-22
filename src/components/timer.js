import React, { Component } from "react";
import Confirmation from "./confirmation";
import _ from "lodash";

export default class Timer extends Component {
  state = {
    hour: 0,
    minute: 0,
    second: 0,
    showErrorModal: false,
    showConfirmation: false
  };

  toggleConfirmation = () => {
    this.setState({ showConfirmation: !this.state.showConfirmation });
  };

  toggleErrorModal = () => {
    this.setState({ showErrorModal: !this.state.showErrorModal });
  };

  formatTime = date => {
    const year = date.getFullYear();
    const month = this.formatSingleDigit(date.getMonth() + 1);
    const day = this.formatSingleDigit(date.getDate());
    const hour = this.formatSingleDigit(date.getHours());
    const min = this.formatSingleDigit(date.getMinutes());
    const sec = this.formatSingleDigit(date.getSeconds());

    return `${year}-${month}-${day}T${hour}:${min}:${sec}`;
  }

  formatSingleDigit = timeVal => {
    return timeVal = timeVal < 10 ? `0${timeVal}` : timeVal;
  }

  postTimerValues = async () => {
    const url = "https://www.matainventive.com/cordovaserver/database/inserttimestart.php";
    const currentDate = new Date();
    const today = this.formatTime(currentDate);
    const currentDateGMT = new Date(currentDate.getTime() + (currentDate.getTimezoneOffset() * 60000));
    const todayserver = this.formatTime(currentDateGMT);
    const data = {
      userid: JSON.parse(localStorage.getItem("Mata Inventive")).ID,
      deviceid: this.props.machine.device_id,
      hour: this.state.hour,
      minute: this.state.minute,
      second: this.state.second,
      today: today,
      todayserver: todayserver
    }

    fetch(url, {
      method: 'POST',
      body: "userid="+data.userid+"&deviceid="+data.deviceid+"&hour="+data.hour+"&minute="+data.minute+"&second="+data.second+"&today="+data.today+"&todayserver="+data.todayserver+"&insert=",
      headers:{ 'Content-Type':'application/x-www-form-urlencoded' }
    }).then(res => console.log(res))
    .then(response => console.log('Success:', JSON.stringify(response)))
    .catch(error => console.error('Error:', error));
  }

  handleStartTimer = () => {
    if (this.state.hour === 0 && this.state.minute === 0 && this.state.second === 0) {
      this.toggleErrorModal();
    } else {
      this.postTimerValues().then(res => {
        console.log(res);
        const currState = this.state;
        const { showConfirmation, ...timerVals } = currState;
        const timerInMilliSeconds = ((parseInt(timerVals.hour)*3600) + (parseInt(timerVals.minute)*60) + parseInt(timerVals.second))*1000;
        const dateString = this.formatTime(new Date(timerInMilliSeconds))
        this.props.setDeviceTimer(this.props.machine.cell_id, this.props.machine.device_id, dateString);
        this.toggleConfirmation();
      })
    }
  };

  updateTimerValue = field => {
    return () => {
      const timerType = this.props.notificationTimer ? `.${this.props.dndTimerType}` : "";
      const selectorClass = this.props.notificationTimer ? `.timer-selector-bar${timerType}` : ".timer-selector-bar"
      let selector = document
        .querySelector(selectorClass)
        .getBoundingClientRect();
      let fieldElements = document.querySelectorAll(`.timer-value.${field}${timerType}`);
      // for each timer element that isn't one of the empty spaces for placeholder/styling purposes, get the average of its top and bottom positions and check that against the selector bar's top and bottom bounding positions to determine if it should be selected and also update the state's value for that timer spec for handling submit
      fieldElements.forEach(elem => {
        if (elem.innerHTML !== " ") {
          const timerTypeNoPeriod = timerType.slice(1, timerType.length);
          let scrollPos =
            (elem.getBoundingClientRect().top +
              elem.getBoundingClientRect().bottom) /
            2;
          if (scrollPos >= selector.top && scrollPos <= selector.bottom) {
            elem.className = `timer-value ${field} ${timerTypeNoPeriod} selected`;
            this.setState({ [field]: parseInt(elem.innerHTML) });
          } else {
            if (elem.className !== `timer-value ${field} ${timerTypeNoPeriod}`) {
              elem.className = `timer-value ${field} ${timerTypeNoPeriod}`;
            }
          }
        }
      });
    };
  };

  renderTask = () => {
    const scrollables = Object.keys(this.state).map((timerSpec, idx) => {
      if (timerSpec !== "showConfirmation" && timerSpec !== "showErrorModal") {
        return (
          <Scrollable
            key={idx}
            spec={timerSpec}
            updateTimerValue={this.updateTimerValue}
            notificationTimer={this.props.notificationTimer}
            dndTimerType={this.props.dndTimerType}
          />
        );
      }
    });

    if (this.state.showConfirmation) {
      return (
        <Confirmation
          task="Timer"
          hideTask={this.props.hideTask}
          toggleConfirmation={this.toggleConfirmation}
        />
      );
    } else {
      const containerClassName = this.props.notificationTimer ? "timer-container notification" : "timer-container";
      const buttonClassName = this.props.notificationTimer ? "form-submit-button hide" : "form-submit-button";
      const selectorClassName = this.props.notificationTimer ? `timer-selector-bar ${this.props.dndTimerType}` : "timer-selector-bar";

      const errorModal = this.state.showErrorModal ? (
        <span className="start-job-modal-overlay">
          <div className="start-job-modal-container">
            <p>Please select a timer greater than 0Hr 0Min 0Sec.</p>
            <button
              className="form-submit-button"
              onClick={this.toggleErrorModal}
            >
              Ok
            </button>
          </div>
        </span>
      ) : (
        ""
      );
      return (
        <div className={containerClassName}>
          <div className="timer-specs-container">
            {errorModal}
            <span className={selectorClassName} />
            {scrollables}
          </div>
          <button
            className={buttonClassName}
            onClick={this.handleStartTimer}
          >
            Start
          </button>
        </div>
      );
    }
  };

  render = () => {
    const className = this.props.notificationTimer ? "overlay notification" : "overlay";
    return (
      <div>
        <div className={className} onClick={this.props.hideTask} />
        {this.renderTask()}
      </div>
    );
  };
}

const Scrollable = props => {
  const header = _.capitalize(props.spec);
  const arrayLength = props.spec === "hour" ? 13 : 60;

  return (
    <div className="timer-input-container">
      <h4>{header}</h4>
      <div
        className="timer-scrollable-container"
        onScroll={props.updateTimerValue(props.spec)}
      >
        {[" ", " ", " ", " ", " ", " ", " ", " "]
          .concat([...Array(arrayLength).keys()])
          .concat([" ", " ", " ", " ", " ", " ", " ", " ", " "])
          .map((val, idx) => {
            const timerType = props.notificationTimer ? props.dndTimerType : "";
            const className =
              val === 0
                ? `timer-value ${props.spec} ${timerType} selected`
                : `timer-value ${props.spec} ${timerType}`;
            return (
              <p key={idx} className={className}>
                {val}
              </p>
            );
          })}
      </div>
    </div>
  );
};
