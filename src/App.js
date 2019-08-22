import React, { Component } from "react";
import Splash from "./components/splash";
import Navbar from "./components/navbar";
import Chat from "./components/chat/chat";
import Profile from "./components/profile/profile";
import Main from "./components/main";
import "./App.css";

export default class App extends Component {
  state = {
    user: {
      name: "Awesome Machinist",
      notifications: {
        Text: true,
        Email: false,
        "Do Not Disturb": {
          on: true,
          From: {
            hour: null,
            min: null,
            sec: null
          },
          To: {
            hour: null,
            min: null,
            sec: null
          }
        }
      }
    },
    cells: {},
    chats: {
      Machines: {},
      Parts: {},
      Jobs: {}
    },
    isLoading: true,
    machineSelected: null,
    toggledNavbarMenu: null,
    displayChat: null,
    displayProfile: null
  };

  componentDidMount = () => {
    const userData = localStorage.getItem("Mata Inventive");
    if (userData) {
      this.logIn(JSON.parse(userData).ID);
    }
  };

  logIn = id => {
    this.loadData(id).then(data => {
      this.setState({ cells: data[0], chats: data[1], isLoading: false })
    });
  };

  fetchData = async url => {
    const res = await fetch(url).then(res => res.json()).catch(err => console.log("err", err));
    return res;
  };

  createDevicesDetailsUrl = id => {
    const localTime = this.formatTime(new Date());
    return `https://www.matainventive.com/cordovaserver/database/jsonmatafloorplan.php?id=${id}&today=${localTime}`;
  }

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

  // converts Date.now() milliseconds into the time, in the appropriate measurement, since the message was sent
  timeConversion = millisec => {
    const seconds = (millisec / 1000).toFixed(0);
    const minutes = (millisec / (1000 * 60)).toFixed(0);
    const hours = (millisec / (1000 * 60 * 60)).toFixed(0);
    const days = (millisec / (1000 * 60 * 60 * 24)).toFixed(0);
    if (seconds < 60) {
      return seconds + " Sec";
    } else if (minutes < 60) {
      const mins = parseInt(minutes) === 1 ? " Min" : " Mins";
      return minutes + mins;
    } else if (hours < 24) {
      const hrs = parseInt(hours) === 1 ? " Hr" : " Hrs";
      return hours + hrs;
    } else {
      const ds = parseInt(days) === 1 ? " Day" : " Days";
      return days + ds;
    }
  };

  loadData = async id => {
    const cellsUrl = `https://www.matainventive.com/cordovaserver/database/jsonmatacell.php?id=${id}`;
    const cells = await this.fetchData(cellsUrl).then(cellsData => cellsData);
    const devicesUrl = `https://www.matainventive.com/cordovaserver/database/jsonmatacelladd.php?id=${id}`;
    const devices = await this.fetchData(devicesUrl).then(devicesData => devicesData);
    const devicesDetailsUrl = this.createDevicesDetailsUrl(id);
    const devicesDetails = await this.fetchData(devicesDetailsUrl).then(devsDetsData => devsDetsData);
    const jobsPartsUrl = `https://www.matainventive.com/cordovaserver/database/jsonmataparts.php?id=${id}`;
    const jobsParts = await this.fetchData(jobsPartsUrl).then(jobsPartsData => jobsPartsData);
    const timersUrl = `https://www.matainventive.com/cordovaserver/database/jsonmataSensor.php?id=${id}`;
    const timers = await this.fetchData(timersUrl).then(timerData => timerData);

    const currentTime = Date.now();
    const dataArr = await Promise.all([cells, devices, devicesDetails, jobsParts, timers]).then(data => {
      const cells = data[0];
      const devices = data[1];
      const devicesDetails = this.createDeviceObject(data[2]);
      const jobsParts = data[3];
      const timers = this.createObjectWithIDKeys(data[4]);

      let cellObj = {};
      let chatObj = { Machines:{}, Parts:{}, Jobs:{} };
      cells.forEach(cell => {
        let dataObj = {};
        dataObj["cellName"] = cell.name;
        const cellDevices = devices.filter(device => device.cell_id === cell.cell_id);
        let cellDevsObj = {};
        cellDevices.forEach(cellDev => {
          const id = cellDev.device_id;
          const devObj = devicesDetails[id];
          let utilization = Math.round((parseInt(devObj.SumDayUpTime) / parseInt(devObj.SumONTimeSeconds)) * 100);
          utilization = utilization.toString() === "NaN" ? 0 : utilization;
          cellDev["utilization"] = utilization;
          let timer = "";
          const devTimer = timers[id];
          if (devTimer) {
            const timerEndTime = new Date(devTimer.MaxEndTimeIdle).getTime();
            const remaining = timerEndTime - currentTime;
            if (remaining > 0) {
              const timerRemaining = this.timeConversion(remaining);
              timer = `${timerRemaining} Remain On Timer`;
            } else if (remaining < 0 && this.formatTime(new Date(currentTime)).slice(0, 10) === this.formatTime(new Date(timerEndTime)).slice(0, 10)) {
              const timerDuration = this.timeConversion(timerEndTime - new Date(devTimer.MaxStartTimeActive).getTime());
              timer = `${timerDuration} Timer Finished`;
            }
          }
          cellDev["timer"] = timer;
          let status;
          const maxOnTime = currentTime - new Date(devObj.MaxOnTime).getTime();
          const maxEndTime = currentTime - new Date(devObj.MaxEndTime).getTime();
          if (maxOnTime <= 600000) {
            // if (devObj.MaxEndTime <= devObj.MaxStartTime || maxEndTime <= 600000) {
              status = "Online";
            // }
          } else {
            status = "Offline";
          }
          cellDev["status"] = status;
          chatObj.Machines[devObj.name] = { chatHistory: { chatFirstBegan: "", chatLog: [] }, responses: {"Machine Utilization": `${utilization}% of utilization.`, "Machine Status": status} }
          cellDevsObj[id] = cellDev;
        })
        dataObj["devices"] = cellDevsObj;
        cellObj[cell.cell_id] = dataObj
      });

      const latestJobPartDate = jobsParts[0].EditTime.slice(0, 10);
      jobsParts.forEach(jobPart => {
        const { EditTime: editTime, jobnumber, partnumber, partcount } = jobPart;
        if (editTime.slice(0, 10) === latestJobPartDate) {
          chatObj.Jobs[jobnumber] = { chatHistory: { chatFirstBegan: "", chatLog: [] }, responses: {"Start Time": editTime, "Part Number": partnumber, "Part Count": partcount} };
          if (!chatObj.Parts[partnumber]) {
            chatObj.Parts[partnumber] = { chatHistory: { chatFirstBegan: "", chatLog: [] }, responses: {"Start Time": editTime, "Job Number": jobnumber, "Part Count": partcount} };
          }
        }
      })

      return [cellObj, chatObj]
    })

    return dataArr;
  }

  createDeviceObject = devicesArr => {
    if (devicesArr[0].some(devDet => devDet["RecordDate"] !== "1970/01/01")) {
      devicesArr = devicesArr[0].filter(devDet => devDet["RecordDate"] !== "1970/01/01");
    } else {
      if (devicesArr[1].length > 0) {
        devicesArr = devicesArr[1];
      } else {
        devicesArr = devicesArr[0];
      }
    }
    return this.createObjectWithIDKeys(devicesArr);
  }

  createObjectWithIDKeys = objectsArr => {
    let outputObject = {};
    objectsArr.forEach(obj => {
      let newObj = {};
      let id;
      Object.keys(obj).forEach(key => {
        if (key === "device_id") {
          id = obj[key];
        } else {
          newObj[key] = obj[key];
        }
      });
      outputObject[id] = newObj;
    })
    return outputObject;
  }

  // toggles between Overview and Floorplan views within Feed component based on toggled value from Footer component (currently removed)
  selectView = view => {
    this.setState({ viewSelected: view });
  };

  // this function is passed down as props all the way to Feed Item component to select a machine and view/interact with the machine's various tasks
  toggleMachineSelection = machInfo => {
    return () => {
      this.setState({ machineSelected: machInfo });
    };
  };

  setDeviceTimer = (cellId, deviceId, timerVals) => {
    let newCells = Object.assign(this.state.cells, {});
    const currentTime = Date.now();
    const timerInMilliSeconds = ((parseInt(timerVals.hour)*3600) + (parseInt(timerVals.minute)*60) + parseInt(timerVals.second))*1000;
    const timerTime = new Date(currentTime + timerInMilliSeconds).getTime();
    const timerRemaining = this.timeConversion(timerTime - currentTime);
    newCells[cellId].devices[deviceId].timer = `${timerRemaining} Remain On Timer`;
    this.setState({ cells: newCells });
  }

  // transition effects for chat submenu when clicking the navbar's left logo icon;
  // chat menu is positioned off of the viewport by an amount equal to its width until the logo icon is toggled, where it slides in as the app's Main component also slides off the viewport to the right by the same width.
  toggleNavbarMenu = type => {
    let menu, mainPos, mainTransform, sideMenuTransform;
    if (type !== null) {
      menu = type;
      mainPos = "fixed";
      mainTransform =
        type === "chat" ? "translateX(85vw)" : "translateX(-85vw)";
      sideMenuTransform = "none";
    } else {
      menu = this.state.toggledNavbarMenu;
      mainPos = "static";
      mainTransform = "none";
      sideMenuTransform =
        this.state.toggledNavbarMenu === "chat"
          ? "translateX(-85vw)"
          : "translateX(85vw)";
    }
    document.getElementById(menu).style.transform = sideMenuTransform;
    document.getElementById("nav").style.transform = mainTransform;
    document.getElementById("main").style.transform = mainTransform;
    document.getElementById("main").style.position = mainPos;
    this.setState({ toggledNavbarMenu: type });
  };

  // select chat stores both the type (Machine, Part, Job, etc..) and the specific chat within the type group
  selectChat = (type, chat) => {
    return () => {
      this.setState({ displayChat: [type, chat] });
      this.toggleNavbarMenu(null);
    };
  };

  hideChat = () => {
    this.setState({ displayChat: null });
    this.toggleNavbarMenu("chat");
  };

  setInitialTime = (type, chat, time) => {
    let newChats = this.state.chats;
    newChats[type][chat].chatHistory.chatFirstBegan = time;
    this.setState({ chats: newChats });
  }

  postNewMessages = async (type, chat) => {
    const url = "https://www.matainventive.com/cordovaserver/database/insertchat.php";
    console.log("history", JSON.stringify(this.state.chats[type][chat].chatHistory));
    const data = {
      userid: JSON.parse(localStorage.getItem("Mata Inventive")).ID,
      type: chat,
      chat_history: JSON.stringify(this.state.chats[type][chat].chatHistory)
    }

    fetch(url, {
      method: 'POST',
      body: "userid="+data.userid+"&type="+data.type+"&chat_history="+data.chat_history+"&insert=",
      headers:{ 'Content-Type':'application/x-www-form-urlencoded' }
    }).then(res => console.log(res))
    .then(response => console.log('Success:', JSON.stringify(response)))
    .catch(error => console.error('Error:', error));
  }

  sendNewMessage = (type, chat, message) => {
    let newChats = this.state.chats;
    const newMessage = ["user", message, Date.now()];
    newChats[type][chat].chatHistory.chatLog.push(newMessage);
    this.setState({ chats: newChats });
    this.machineReplyMessage(type, chat, message);
  };

  machineReplyMessage = (type, chat, message) => {
    const errorReply = "Error code 404, aka something wrong with your input. Maybe try one of the presets?";
    let newChats = this.state.chats;
    let replyMessage = newChats[type][chat].responses[message];
    replyMessage = replyMessage ? replyMessage : errorReply;
    replyMessage = ["machine", replyMessage];
    newChats[type][chat].chatHistory.chatLog.push(replyMessage);
    this.setState({ chats: newChats });
    this.postNewMessages(type, chat);
  };

  selectProfile = type => {
    return () => {
      this.setState({ displayProfile: type });
      this.toggleNavbarMenu(null);
    };
  };

  hideProfile = () => {
    this.setState({ displayProfile: null });
    this.toggleNavbarMenu("profile");
  };

  toggleNotification = type => {
    return () => {
      let newUser = this.state.user;
      if (type === "Do Not Disturb") {
        newUser.notifications[type].on = !newUser.notifications[type].on;
      } else {
        newUser.notifications[type] = !newUser.notifications[type];
      }
      this.setState({ user: newUser });
    };
  };

  render = () => {
    if (!localStorage.getItem("Mata Inventive")) {
      return <Splash fetchData={this.fetchData} logIn={this.logIn} chats={this.state.chats}/>;
    } else {
      return (
        this.state.isLoading ? <div>Loading...</div> :
        <div className="app-container">
          <div
            className="overlay"
            onClick={() => this.toggleNavbarMenu(null)}
            style={{
              display: this.state.toggledNavbarMenu ? "block" : "none"
            }}
          />
          <span id="chat" className="chat-wrapper">
            <Chat selectChat={this.selectChat} chats={this.state.chats} />
          </span>
          <div>
            <Navbar
              toggleNavbarMenu={this.toggleNavbarMenu}
              displayChat={this.state.displayChat}
              displayProfile={this.state.displayProfile}
              hideChat={this.hideChat}
              hideProfile={this.hideProfile}
            />
            <Main
              fetchData={this.fetchData}
              user={this.state.user}
              cells={this.state.cells}
              chats={this.state.chats}
              displayChat={this.state.displayChat}
              displayProfile={this.state.displayProfile}
              setInitialTime={this.setInitialTime}
              sendNewMessage={this.sendNewMessage}
              toggleNotification={this.toggleNotification}
              machineSelected={this.state.machineSelected}
              toggleMachineSelection={this.toggleMachineSelection}
              setDeviceTimer={this.setDeviceTimer}
            />
          </div>
          <span id="profile" className="profile-wrapper">
            <Profile
              userName={this.state.user.name}
              selectProfile={this.selectProfile}
            />
          </span>
        </div>
      );
    }
  };
}
