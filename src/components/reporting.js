import React, { Component } from "react";
import Confirmation from "./confirmation";

export default class Reporting extends Component {
  state = {
    cells: {
      Machining: {
        "Clean Chamber": false,
        "Clear Alarm": false,
        "Inspection Room": false
      },
      Preparation: {
        "Job Spec Confirmation": false,
        "Revise CAD Modeling": false,
        "Edit Toolpath": false
      },
      Note: ""
    },
    cellSelected: "Machining",
    prevCell: null,
    displayNote: false,
    prevNote: "",
    firstCellSelection: true,
    showConfirmation: false
  };

  componentDidMount = () => {
    const reportingDict = {
      clean: ["Machining", "Clean Chamber"],
      offset: ["Machining", "Clear Alarm"],
      inspection: ["Machining", "Inspection Room"],
      speccheck: ["Preparation", "Job Spec Confirmation"],
      cadwork: ["Preparation", "Revise CAD Modeling"],
      toolpath: ["Preparation", "Edit Toolpath"]
    };

    let reportingObj = { Machining: {}, Preparation: {} };
    Object.keys(this.props.machine.reporting).forEach(prepType => {
      let prepVal = this.props.machine.reporting[prepType];
      if (prepType === "notes") {
        reportingObj.Note = prepVal;
      } else {
        prepVal = this.handleEmptyString(prepVal);
        const stateKeys = reportingDict[prepType];
        reportingObj[stateKeys[0]][stateKeys[1]] = prepVal;
      }
    });
    this.setState({ cells: reportingObj, prevNote: reportingObj.Note });
  };

  handleEmptyString = str => {
    if (typeof str === "string") {
      if (str === "false") {
        return JSON.parse(str);
      } else {
        return str;
      }
    } else {
      return str;
    }
  };

  selectCell = cell => {
    return () => {
      if (this.state.firstCellSelection) {
        this.setState({ firstCellSelection: false });
      }
      // if Note is selected, open Note textbox on top of the usual selecting of cell styling change
      if (cell === "Note") {
        this.setState({ prevCell: this.state.cellSelected });
        this.toggleNote();
      }
      document.getElementById(this.state.cellSelected).className = "cell";
      document.getElementById(cell).className = "cell selected";
      this.setState({ cellSelected: cell });
    };
  };

  update = e => {
    let newCells = this.state.cells;
    newCells.Note = e.currentTarget.value;
    this.setState({ cells: newCells });
  };

  toggleConfirmation = () => {
    this.setState({ showConfirmation: !this.state.showConfirmation });
  };

  saveChecklistValues = async () => {
    const url =
      "https://www.matainventive.com/cordovaserver/database/insertprepall.php";
    const data = {
      userid: JSON.parse(localStorage.getItem("Mata Inventive")).ID,
      deviceid: this.props.machine.device_id,
      prepspec: this.state.cells.Preparation["Job Spec Confirmation"],
      prepcad: this.state.cells.Preparation["Revise CAD Modeling"],
      preppath: this.state.cells.Preparation["Edit Toolpath"],
      prepreporting: this.state.cells.Machining["Clear Alarm"],
      prepclean: this.state.cells.Machining["Clean Chamber"],
      partnumber: "",
      jobnumber: "",
      inspection: this.state.cells.Machining["Inspection Room"]
    };

    fetch(url, {
      method: "POST",
      body:
        "userid=" +
        data.userid +
        "&deviceid=" +
        data.deviceid +
        "&prepspec=" +
        data.prepspec +
        "&prepcad=" +
        data.prepcad +
        "&preppath=" +
        data.preppath +
        "&prepoffset=" +
        data.prepreporting +
        "&prepclean=" +
        data.prepclean +
        "&partnumber=" +
        data.partnumber +
        "&jobnumber=" +
        data.jobnumber +
        "&inspection=" +
        data.inspection +
        "&insert=",
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
      .then(res => console.log(res))
      .then(response => console.log("Success:", JSON.stringify(response)))
      .catch(error => console.error("Error:", error));
  };

  handleSaveChecklist = () => {
    this.saveChecklistValues().then(res => {
      console.log(res);
      this.props.saveReporting(
        this.props.machine.cell_id,
        this.props.machine.device_id,
        this.state.cells
      );
      this.toggleConfirmation();
    });
  };

  toggleChecklist = checkList => {
    return () => {
      let newCells = this.state.cells;
      let bool = newCells[this.state.cellSelected][checkList];
      newCells[this.state.cellSelected][checkList] = bool ? false : true;
      this.setState({ cells: newCells });
    };
  };

  postNote = async () => {
    const url =
      "https://www.matainventive.com/cordovaserver/database/insertnote.php";
    const data = {
      userid: JSON.parse(localStorage.getItem("Mata Inventive")).ID,
      deviceid: this.props.machine.device_id,
      note: this.state.cells.Note,
      partnumber: "",
      jobnumber: ""
    };

    fetch(url, {
      method: "POST",
      body:
        "userid=" +
        data.userid +
        "&deviceid=" +
        data.deviceid +
        "&note=" +
        data.note +
        "&partnumber=" +
        data.partnumber +
        "&jobnumber=" +
        data.jobnumbernote +
        "&insert=",
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    })
      .then(res => console.log(res))
      .then(response => console.log("Success:", JSON.stringify(response)))
      .catch(error => console.error("Error:", error));
  };

  // after saving Note, switch back to the previous cell view that the user was at before displaying Note
  saveNote = () => {
    this.postNote().then(res => {
      console.log(res);
      document.getElementById(this.state.cellSelected).className = "cell";
      document.getElementById(this.state.prevCell).className = "cell selected";
      this.setState({
        cellSelected: this.state.prevCell,
        prevCell: null,
        prevNote: this.state.cells.Note
      });
      this.toggleNote();
    });
  };

  // similar logic to save note, but uses a previously saved value to switch the value back to it so as not to save any updates the user may have
  closeNote = () => {
    let newCells = this.state.cells;
    newCells.Note = this.state.prevNote;
    this.setState({ cells: newCells, cellSelected: this.state.prevCell });
    document.getElementById(this.state.cellSelected).className = "cell";
    document.getElementById(this.state.prevCell).className = "cell selected";
    this.toggleNote();
  };

  toggleNote = () => {
    this.setState({ displayNote: !this.state.displayNote });
  };

  renderCells = () => {
    return Object.keys(this.state.cells).map((cell, idx) => {
      // first cell when rendering component sets styling for blue border on the first cell
      const className =
        this.state.firstCellSelection && idx === 0 ? "cell selected" : "cell";
      return (
        <span
          key={idx}
          id={cell}
          className={className}
          onClick={this.selectCell(cell)}
        >
          {cell}
        </span>
      );
    });
  };

  renderTask = () => {
    if (this.state.showConfirmation) {
      return (
        <Confirmation
          task="Preparation Checklist"
          hideTask={this.props.hideTask}
          toggleConfirmation={this.toggleConfirmation}
        />
      );
    } else {
      const note = this.state.displayNote ? (
        <div>
          <div
            className="preparation-checklist-note-overlay"
            onClick={this.closeNote}
          />
          <div className="preparation-checklist-note-container">
            <h5>Add Note</h5>
            <textarea value={this.state.cells.Note} onChange={this.update} />
            <button className="form-submit-button" onClick={this.saveNote}>
              Save
            </button>
          </div>
        </div>
      ) : (
        ""
      );

      const checklistButtons = Object.keys(
        this.state.cells[this.state.cellSelected]
      ).map((checkList, idx) => (
        <Button
          key={idx}
          type={checkList}
          cell={this.state.cellSelected}
          toggleChecklist={this.toggleChecklist}
          bool={this.state.cells[this.state.cellSelected][checkList]}
        />
      ));

      return (
        <div>
          <div className="preparation-checklist-container">
            <h4>Start Prep</h4>
            <header className="preparation-checklist-cells-container">
              {this.renderCells()}
            </header>
            <section className="preparation-checklist-body">
              <div className="preparation-checklist-buttons-container">
                {checklistButtons}
              </div>
              <button
                className="form-submit-button"
                onClick={this.handleSaveChecklist}
              >
                Save
              </button>
              {note}
            </section>
          </div>
        </div>
      );
    }
  };

  render = () => {
    return (
      <div>
        <div className="overlay" onClick={this.props.hideTask} />
        {this.renderTask()}
      </div>
    );
  };
}

const Button = props => {
  return (
    <div>
      {props.cell !== "Note" ? (
        <div
          id={props.type}
          className="preparation-checklist-button-container"
          style={{
            backgroundImage: props.bool
              ? "radial-gradient(circle at 50% 50%, #FFFFFF, #2E5BFF)"
              : ""
          }}
          onClick={props.toggleChecklist(props.type)}
        >
          <p>{props.type}</p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
