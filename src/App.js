import React, { Component } from 'react';
import styles from './App.scss';

import StyleTransition from './StyleTransition';
import Expand from './Expand';

class App extends Component {

  state = {
    in: false
  }

  handleToggle = () => {
    this.setState({ in: !this.state.in });
  }

  render() {

    const from = {
      color: 'white',
      backgroundColor: 'black'
    }
    const to = {
      color: 'black',
      backgroundColor: 'white'
    }

    return (
      <div>
        <label style={{ position: 'absolute', right: 0, margin: 200, padding: 100, backgroundColor: 'lightblue' }}>
          <input
            type="checkbox"
            checked={this.state.in}
            onChange={this.handleToggle}
          />
          TOGGLE
        </label>
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {/* <StyleTransition
            in={this.state.in}

            styles={{
              enter: from,
              entering: to,
              entered: to,

              exit: to,
              exiting: from,
              exited: from
            }}
          >
            <div>
              <div>hello world</div>
              <div>hello world</div>
              <div>hello world</div>
              <div>hello world</div>
              <div>hello world</div>
            </div>
          </StyleTransition> */}
          <Expand
            in={this.state.in}
          >
            <div>
              <div>hello world</div>
              <div>hello world</div>
              <div>hello world</div>
              <div>hello world</div>
              <div>hello world</div>
            </div>
          </Expand>
        </div>
      </div>
    );
  }
}

export default App;
