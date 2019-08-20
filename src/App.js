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
    cells: [],
    chats: {
      Machines: {
        "Machine 1": {
          chatFirstBegan: "12:30 pm",
          chatHistory: [
            ["machine", "Job 37TEAXEDI87 is done."],
            ["user", "Machine Utilization", 1565484493897],
            ["machine", "90% of utilization."]
          ],
          responses: {
            "Machine Utilization": "90% of utilization.",
            "Machine Health": "As healthy as your grandparents.",
            "Machine Status": "Code Red.",
            "Machine Maintenance": "Maintenance mandatory."
          }
        },
        "Eurotech 1": {
          chatFirstBegan: "12:30 pm",
          chatHistory: [
            ["machine", "Job 57HXET89EEA is done."],
            ["user", "Machine Utilization", 1565482493897],
            ["machine", "80% of utilization."]
          ],
          responses: {
            "Machine Utilization": "80% of utilization.",
            "Machine Health": "A solid B+.",
            "Machine Status": "Pretty solid.",
            "Machine Maintenance": "Maintenance optional."
          }
        },
        "Eurotech 2": {
          chatFirstBegan: "12:30 pm",
          chatHistory: [
            ["machine", "Job 99AYYOT6653 is done."],
            ["user", "Machine Utilization", 1565484453897],
            ["machine", "70% of utilization."]
          ],
          responses: {
            "Machine Utilization": "70% of utilization.",
            "Machine Health": "Not bad, but not great.",
            "Machine Status": "Don't worry about it, yet.",
            "Machine Maintenance": "Maintenance recommended."
          }
        },
        "Franz Cell 2": {
          chatFirstBegan: "12:30 pm",
          chatHistory: [
            ["machine", "Job 12389HAAU89 is done."],
            ["user", "Machine Utilization", 1565484775208],
            ["machine", "60% of utilization."]
          ],
          responses: {
            "Machine Utilization": "60% of utilization.",
            "Machine Health": "Straight A's like an Asian.",
            "Machine Status": "Strong as an ox.",
            "Machine Maintenance": "Maintenance would be a waste of money."
          }
        }
      },
      Parts: {
        "57HXET89EEA": {
          chatFirstBegan: "12:30 pm",
          chatHistory: [
            ["machine", "Participation in Job 37TEAXEDI87 is done."],
            ["user", "Part Utilization", 1565484493897],
            ["machine", "90% of utilization."]
          ],
          responses: {
            "Part Utilization": "90% of utilization.",
            "Part Health": "As healthy as your grandparents.",
            "Part Status": "Code Red.",
            "Part Maintenance": "Maintenance mandatory."
          }
        },
        "99AYYOT6653": {
          chatFirstBegan: "12:30 pm",
          chatHistory: [
            ["machine", "Participation in Job 99AYYOT6653 is done."],
            ["user", "Part Utilization", 1565484453897],
            ["machine", "70% of utilization."]
          ],
          responses: {
            "Part Utilization": "70% of utilization.",
            "Part Health": "Not bad, but not great.",
            "Part Status": "Don't worry about it, yet.",
            "Part Maintenance": "Maintenance recommended."
          }
        },
        "12389HAAU89": {
          chatFirstBegan: "12:30 pm",
          chatHistory: [
            ["machine", "Participation in Job 12389HAAU89 is done."],
            ["user", "Part Utilization", 1565484775208],
            ["machine", "60% of utilization."]
          ],
          responses: {
            "Part Utilization": "60% of utilization.",
            "Part Health": "Straight A's like an Asian.",
            "Part Status": "Strong as an ox.",
            "Part Maintenance": "Maintenance would be a waste of money."
          }
        }
      },
      Jobs: {
        "57HXET89EEA": {
          chatFirstBegan: "12:30 pm",
          chatHistory: [
            ["machine", "Job 57HXET89EEA is done."],
            ["user", "Job duration.", 1565484775208],
            ["machine", "5 hours 18 minutes."]
          ],
          responses: {
            "Job Duration": "5 hours 18 minutes.",
            "Job Result": "Failure.",
            "Job Notes": "Part 99AYYOT6653 failed 3 hours in."
          }
        },
        "99AYYOT6653": {
          chatFirstBegan: "12:30 pm",
          chatHistory: [
            ["machine", "Job 99AYYOT6653 is done."],
            ["user", "Job duration.", 1565484775208],
            ["machine", " 18 seconds."]
          ],
          responses: {
            "Job Duration": "18 seconds.",
            "Job Result": "Failure.",
            "Job Notes": "Part 12389HAAU89 was dead on arrival."
          }
        },
        "12389HAAU89": {
          chatFirstBegan: "12:30 pm",
          chatHistory: [
            ["machine", "Job 12389HAAU89 is done."],
            ["user", "Job duration.", 1565484775208],
            ["machine", "8 hours."]
          ],
          responses: {
            "Job Duration": "8 hours.",
            "Job Result": "Success.",
            "Job Notes": "Part 57HXET89EEA requires maintenance."
          }
        }
      }
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
      this.loadData(JSON.parse(userData).ID).then(data => {
        this.setState({ cells: data, isLoading: false })
      });
    }
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

  loadData = async id => {
    const cellsUrl = `https://www.matainventive.com/cordovaserver/database/jsonmatacell.php?id=${id}`;
    const cells = await this.fetchData(cellsUrl).then(cellsData => cellsData);
    const devicesUrl = `https://www.matainventive.com/cordovaserver/database/jsonmatacelladd.php?id=${id}`;
    const devices = await this.fetchData(devicesUrl).then(devicesData => devicesData);
    const devicesDetailsUrl = this.createDevicesDetailsUrl(id);
    const devicesDetails = await this.fetchData(devicesDetailsUrl).then(devsDetsData => devsDetsData);

    const dataArr = await Promise.all([cells, devices, devicesDetails]).then(data => {
      const cells = data[0];
      const devices = data[1];
      const devicesDetails = this.createDeviceObject(data[2]);
      return cells.map(cell => {
        let dataObj = {};
        dataObj["cellName"] = cell.name;
        let cellDevices = devices.filter(device => device.cell_id === cell.cell_id);
        cellDevices = cellDevices.map(cellDev => {
          const id = cellDev.device_id;
          const devObj = devicesDetails[id];
          const utilization = Math.round((parseInt(devObj.SumDayUpTime) / parseInt(devObj.SumONTimeSeconds)) * 100);
          let status;
          const maxOnTime = new Date().getTime() - new Date(devObj.MaxOnTime).getTime();
          const maxEndTime = new Date().getTime() - new Date(devObj.MaxEndTime).getTime();
          if (maxOnTime <= 600000) {
            if (devObj.MaxEndTime <= devObj.MaxStartTime || maxEndTime <= 60000) {
              status = "Online";
            }
          } else {
            status = "Offline";
          }
          cellDev["utilization"] = utilization;
          cellDev["status"] = status;
          return cellDev;
        })
        dataObj["devices"] = cellDevices;
        return dataObj;
      })
    })

    return dataArr;
  }

  createDeviceObject = devicesArr => {
    if (devicesArr[0].some(devDet => devDet["RecordDate"] !== "1970/01/01")) {
      devicesArr = devicesArr[0].filter(devDet => devDet["RecordDate"] !== "1970/01/01");
    } else {
      devicesArr = devicesArr[1];
    }
    let devicesObject = {};
    devicesArr.forEach(devObj => {
      let newDevObj = {};
      let id;
      Object.keys(devObj).forEach(key => {
        if (key === "device_id") {
          id = devObj[key];
        } else {
          newDevObj[key] = devObj[key];
        }
      });
      devicesObject[id] = newDevObj;
    })
    return devicesObject;
  }

  logIn = id => {
    this.loadData(id).then(data => this.setState({ cells: data, isLoading: false }));
  };

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

  sendNewMessage = (type, chat, message) => {
    let newChats = this.state.chats;
    let newMessage = ["user", message, Date.now()];
    newChats[type][chat].chatHistory.push(newMessage);
    this.setState({ chats: newChats });
    this.machineReplyMessage(type, chat, message);
  };

  machineReplyMessage = (type, chat, message) => {
    const replies = [
      "Error code 204, it's probably my fault.",
      "Error code 404, it's probably your fault.",
      "Error code 500, it's no one's fault. But I still have nothing for you."
    ];
    let newChats = this.state.chats;
    let replyMessage = newChats[type][chat].responses[message];
    // randomly samples a reply message from the replies array
    replyMessage = replyMessage
      ? replyMessage
      : replies[Math.floor(Math.random() * replies.length)];
    replyMessage = ["machine", replyMessage];
    newChats[type][chat].chatHistory.push(replyMessage);
    this.setState({ chats: newChats });
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
      return <Splash fetchData={this.fetchData} logIn={this.logIn} />;
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
              sendNewMessage={this.sendNewMessage}
              toggleNotification={this.toggleNotification}
              machineSelected={this.state.machineSelected}
              toggleMachineSelection={this.toggleMachineSelection}
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
