import React, { Component } from "react";
import Confirmation from "../confirmation";
import StartJobItem from "./startJobItem";
import Camera from "../camera";

export default class StartJob extends Component {
  state = {
    jobs: [
      {
        jobNum: 1,
        inputValues: {
          jobNumber: "",
          partNumber: "",
          partCount: undefined
        }
      }
    ],
    totalJobs: 1,
    currentJob: 1,
    showErrorModal: false,
    showCamera: false,
    showConfirmation: false
  };

  toggleConfirmation = () => {
    this.setState({ showConfirmation: !this.state.showConfirmation });
  };

  // update the respective input value of specified job number's object
  update = (type, jobNum, value) => {
    let newJobs = this.state.jobs;
    newJobs.forEach(job => {
      if (job.jobNum === jobNum) {
        job.inputValues[type] = value;
      }
    });
    this.setState({ jobs: newJobs });
  };

  addJob = () => {
    let newJobs = this.state.jobs.slice();
    let jobNum = newJobs.length + 1;
    const newJob = {
      jobNum: jobNum,
      inputValues: {
        jobNumber: "",
        partNumber: "",
        partCount: undefined
      }
    };

    newJobs.push(newJob);
    this.setState({
      jobs: newJobs,
      totalJobs: this.state.totalJobs + 1
    });
  };

  swipeJob = dir => {
    return () => {
      let totalJobs = this.state.totalJobs;
      let currJob = this.state.currentJob;
      if (dir === "left") {
        if (currJob === 1) {
          currJob = totalJobs;
        } else {
          currJob -= 1;
        }
      } else if (dir === "right") {
        if (currJob === totalJobs) {
          currJob = 1;
        } else {
          currJob += 1;
        }
      }
      this.setState({ currentJob: currJob });
    };
  };

  insertJob = async idx => {
    const url = "https://www.matainventive.com/cordovaserver/database/insertjob.php";
    const data = {
      userid: JSON.parse(localStorage.getItem("Mata Inventive")).ID,
      deviceid: this.props.machine.device_id,
      jobnumber: this.state.jobs[idx].inputValues.jobNumber,
      partnumber: this.state.jobs[idx].inputValues.partNumber,
      partcount: this.state.jobs[idx].inputValues.partCount
    }

    fetch(url, {
      method: 'POST',
      body: "userid="+data.userid+"&deviceid="+data.deviceid+"&jobnumber="+data.jobnumber+"&partnumber="+data.partnumber+"&partcount="+data.partcount.toString()+"&insert=",
      headers:{ 'Content-Type':'application/x-www-form-urlencoded' }
    }).then(res => console.log(res))
    .then(response => console.log('Success:', JSON.stringify(response)))
    .catch(error => console.error('Error:', error));
  }

  postAllJobs = async () => {
    let jobs = [];
    for (let i=0; i<this.state.jobs.length; i++) {
      const job = await this.insertJob(i);
      jobs.push(job);
    }

    const allJobsRes = await Promise.all(jobs).then(res => {
      console.log("pAll", res);
    })
    return allJobsRes;
  }

  handleSubmit = () => {
    if (this.hasNoEmptyCards()) {
      this.postAllJobs().then(res => {
        console.log("res", res);
        this.toggleConfirmation();
      })
    } else {
      this.toggleEmptyCardModal();
    }
  };

  toggleCamera = () => {
    this.setState({ showCamera: !this.state.showCamera });
  };

  toggleEmptyCardModal = () => {
    this.setState({ showErrorModal: !this.state.showErrorModal });
  };

  // error handling for when user tries to save when there's a startjob with empty field(s)
  hasNoEmptyCards = () => {
    return this.state.jobs.every(job => {
      return Object.keys(job.inputValues).every(inputVal => {
        return job.inputValues[inputVal] ? true : false;
      });
    });
  };

  render = () => {
    const leftArrow =
      this.state.totalJobs > 1 ? (
        <span className="start-job-arrow left" onClick={this.swipeJob("left")}>
          &lsaquo;
        </span>
      ) : (
        ""
      );
    const rightArrow =
      this.state.totalJobs > 1 ? (
        <span
          className="start-job-arrow right"
          onClick={this.swipeJob("right")}
        >
          &rsaquo;
        </span>
      ) : (
        ""
      );

    const errorModal = this.state.showErrorModal ? (
      <span className="start-job-modal-overlay">
        <div className="start-job-modal-container">
          <p>Please complete all job cards' input fields.</p>
          <button
            className="form-submit-button"
            onClick={this.toggleEmptyCardModal}
          >
            Ok
          </button>
        </div>
      </span>
    ) : (
      ""
    );

    const tracker =
      this.state.totalJobs > 1
        ? [...Array(this.state.totalJobs).keys()].map((dot, idx) => {
            let className =
              idx === this.state.currentJob - 1
                ? "start-job-tracker-dot selected"
                : "start-job-tracker-dot";
            return (
              <span key={idx} className={className}>
                &#9679;
              </span>
            );
          })
        : "";

    if (this.state.showConfirmation) {
      return (
        <Confirmation
          task="Start Job"
          hideTask={this.props.hideTask}
          toggleConfirmation={this.toggleConfirmation}
        />
      );
    } else {
      return (
        <div>
          <div className="overlay" onClick={this.props.hideTask} />
          {this.state.showCamera ? (
            <Camera toggleCamera={this.toggleCamera} />
          ) : (
            <div className="start-job-container">
              {errorModal}
              {leftArrow}
              <img
                className="start-job-add"
                src="./assets/add.png"
                alt="Add"
                onClick={this.addJob}
              />
              <h4>
                Start Job {this.state.currentJob} of {this.state.totalJobs}
              </h4>
              <StartJobItem
                key={this.state.jobs[this.state.currentJob - 1].jobNum}
                jobNum={this.state.jobs[this.state.currentJob - 1].jobNum}
                inputValues={
                  this.state.jobs[this.state.currentJob - 1].inputValues
                }
                update={this.update}
                toggleCamera={this.toggleCamera}
              />
              <div className="button-flex-end-wrapper">
                <button
                  className="form-submit-button"
                  onClick={this.handleSubmit}
                >
                  Save
                </button>
              </div>
              <div className="start-job-tracker-container">{tracker}</div>
              {rightArrow}
            </div>
          )}
        </div>
      );
    }
  };
}
