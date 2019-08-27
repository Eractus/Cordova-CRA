import React, { Component } from "react";

export default class Footer extends Component {
  selectView = view => {
    return () => {
      if (this.props.viewSelected !== view) {
        if (view === "overview") {
          document.getElementById("overview").className =
            "footer-text selected";
          document.getElementById("floormap").className = "footer-text";
        } else if (view === "floormap") {
          document.getElementById("overview").className = "footer-text";
          document.getElementById("floormap").className =
            "footer-text selected";
        }
        this.props.selectView(view);
      }
    };
  };

  render = () => {
    return (
      <div className="footer">
        <section onClick={this.selectView("overview")}>
          <img src="./assets/overview.png" alt="Overview" />
          <p id="overview" className="footer-text selected">
            Overview
          </p>
        </section>
        <section onClick={this.selectView("floormap")}>
          <img src="./assets/floormap.png" alt="Floormap" />
          <p id="floormap" className="footer-text">
            Floormap
          </p>
        </section>
      </div>
    );
  };
}
