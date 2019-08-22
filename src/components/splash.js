import React, { Component } from "react";
import _ from "lodash";

export default class Splash extends Component {
  state = {
    Username: "",
    Password: "",
    loginErrors: "",
    showLogin: false
  };

  componentDidMount = () => {
    setTimeout(() => this.setState({ showLogin: true }), 3000);
  };

  componentWillUnmount = () => {
    this.setState({ loginErrors: "" });
  };

  update = field => {
    return e => {
      this.setState({ [field]: e.currentTarget.value });
    };
  };

  handleSubmit = e => {
    e.preventDefault();

    // some error handling to check for empty username/password (username including just whitespace), and then logging in or displayng more errors depending on the outcome of the fetch ajax call
    if (this.state.Username.trim() === "") {
      this.setState({ loginErrors: "Username can't be blank." });
    } else if (this.state.Password === "") {
      this.setState({ loginErrors: "Password can't be blank." });
    } else {
      const url = `https://www.matainventive.com/wp-json/custom-plugin/login?username=${this.state.Username}&password=${this.state.Password}`;
      this.props.fetchData(url).then(data => {
        if (data) {
          this.props.logIn(data.data.ID).then(res => {
            localStorage.setItem('Mata Inventive', JSON.stringify(data.data));
          });
        } else {
          this.setState({ loginErrors: "Username or Password is incorrect." })
        }
      })
    }
  };

  render = () => {
    const inputs = ["Username", "Password"];
    const inputFields = inputs.map((input, idx) => (
      <Input
        key={idx}
        inputType={input}
        inputValue={this.state[input]}
        update={this.update}
      />
    ));

    return (
      <div className="splash">
        <img src="./assets/splash.png" alt="Splash Logo" />
        {this.state.showLogin ? (
          <form className="login-form" onSubmit={this.handleSubmit}>
            <div className="login-form-inputs-container">{inputFields}</div>
            <div className="login-form-password-retrieve">
              <a
                href="https://www.matainventive.com/password-recovery"
                target="_blank"
                rel="noopener noreferrer"
              >
                Forgot Password?
              </a>
            </div>
            <p>{this.state.loginErrors}</p>
            <input className="login-form-button" type="submit" value="Log In" />
          </form>
        ) : (
          ""
        )}
      </div>
    );
  };
}

const Input = props => {
  const type = props.inputType === "Password" ? "password" : "text";
  const imgSrc = `./assets/${_.lowerFirst(props.inputType)}.png`;

  return (
    <div className="login-form-input-container">
      <img src={imgSrc} alt="Input" />
      <input
        type={type}
        placeholder={props.inputType}
        value={props.inputValue}
        onChange={props.update(props.inputType)}
      />
    </div>
  );
};
