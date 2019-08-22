import React, { Component } from "react";
import FeedItem from "./feedItem";

export default class Feed extends Component {
  state = {
    // current cell stores index and the actual cell object - index will be used for selecting element by id
    currentCell: [0, this.props.cells[Object.keys(this.props.cells)[0]]],
    firstCellSelection: true
  };

  // when selecting a new cell, swap class names to change blue border styling as well as setting state.
  selectCell = cellArr => {
    return () => {
      if (this.state.firstCellSelection) {
        this.setState({ firstCellSelection: false });
      }
      if (this.state.currentCell[0] !== cellArr[0]) {
        document.getElementById(this.state.currentCell[0]).className = "cell";
        document.getElementById(cellArr[0]).className = "cell selected";
        this.setState({ currentCell: cellArr });
      }
    };
  };

  renderCells = () => {
    return Object.keys(this.props.cells).map((cell, idx) => {
      cell = this.props.cells[cell];
      // first cell when rendering component sets styling for blue border on the first cell
      const className =
        (this.state.firstCellSelection && idx === 0) || this.state.currentCell[0] === idx ? "cell selected" : "cell";
      return (
        <span
          key={idx}
          id={idx}
          className={className}
          onClick={this.selectCell([idx, cell])}
        >
          {cell.cellName}
        </span>
      );
    });
  };

  render = () => {
    return (
      <div className="feed-container">
        <header className="feed-cells-container">{this.renderCells()}</header>
        <section className="feed-items-container">
          {Object.keys(this.state.currentCell[1].devices).map((machSpecs, idx) => {
            machSpecs = this.state.currentCell[1].devices[machSpecs];
            return (
              <FeedItem
                key={idx}
                machSpecs={machSpecs}
                toggleMachineSelection={this.props.toggleMachineSelection}
              />
            )
          })}
        </section>
      </div>
    );
  };
}
