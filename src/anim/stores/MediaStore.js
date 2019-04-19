import React from 'react';
import clamp from 'lodash/clamp';

const Context = React.createContext();
export default class MediaStore extends React.Component {
  static Consumer = Context.Consumer;

  state = {
    duration: 3000,
    isLooping: true,
    isPlaying: false,
    isReversed: false,
    playhead: 0
  }

  constructor(props) {
    super(props);
    this._controls = (() => {
      let raf = null;
      let prevTime;
  
      const loop = () => {
        const curTime = Date.now();
  
        const timeStep = (curTime - prevTime) * (1 / this.state.duration);
  
        let stop = false;
        let nextPlayhead = this.state.playhead + (this.state.isReversed ? -timeStep : timeStep);
  
        if (nextPlayhead >= 1) {
          if (this.state.isLooping) {
            nextPlayhead -= 1; // loop
          } else {
            nextPlayhead = 1; // clamp
            stop = true;
          }
        } else if(nextPlayhead < 0) {
          if (this.state.isLooping) {
            nextPlayhead += 1; // loop
          } else {
            nextPlayhead = 0;
            stop = true;
          }
        }
  
        this.setState({ playhead: nextPlayhead, isPlaying: !stop });
  
        if (!stop) {
          // continue playing
          prevTime = curTime;
          raf = requestAnimationFrame(loop);
        }
      }
  
      return {
        play: () => {
          if (this.state.isPlaying) return;
  
          let { playhead } = this.state;
          
          // reset if necessary
          if (!this.state.isReversed && playhead === 1) {
            playhead = 0;
          } else if(this.state.isReversed && playhead === 0) {
            playhead = 1;
          }
  
          this.setState({ isPlaying: true, playhead }, () => {
            prevTime = Date.now();
            raf = requestAnimationFrame(loop);
          });
        },
        pause: () => {
          cancelAnimationFrame(raf);
          this.setState({ isPlaying: false });
        },
        stop: () => {
          cancelAnimationFrame(raf);
          this.setState({ isPlaying: false, playhead: 0 });
        }
      }
    })();
  }

  onKeyDown = e => {
    console.log(e, e.code);
    switch(e.code) {
      case 'Enter':
      case 'Space':
        this.state.isPlaying ? this.setPaused() : this.setPlaying();
        break;
      case 'Backspace':
        this.setStopped();
        break;
      case 'ArrowRight':
        this.setPlayhead(e.metaKey ? 1 : this.state.playhead + 0.01);
        break;
      case 'ArrowLeft':
        this.setPlayhead(e.metaKey ? 0 : this.state.playhead - 0.01);
        break;
      case 'End':
        this.setPlayhead(1)
        break;
      case 'Home':
        this.setPlayhead(0);
        break;
      case 'KeyR':
        this.setReversed(!this.state.isReversed);
        break;
      case 'KeyL':
        this.setLooping(!this.state.isLooping);
        break;
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
      case 'Digit6':
      case 'Digit7':
      case 'Digit8':
      case 'Digit9':
        this.setPlayhead(parseInt(e.code.replace('Digit', '')) * 0.1);
        break;
      default:
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown)
  }

  setDuration = (duration) => {
    this.setState({ duration })
  }

  setLooping = (isLooping) => {
    this.setState({ isLooping })
  }

  setReversed = (isReversed) => {
    this.setState({ isReversed })
  }

  setPlaying = () => {
    this._controls.play();
  };

  setPaused = () => {
    this._controls.pause();
  };

  setStopped = () => {
    this._controls.stop();
  };

  setPlayhead = playhead => {
    playhead = clamp(playhead, 0, 1);
    this.setState({ playhead });
  }

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          setDuration: this.setDuration,
          setLooping: this.setLooping,
          setReversed: this.setReversed,
          setPlaying: this.setPlaying,
          setPaused: this.setPaused,
          setStopped:  this.setStopped,
          setPlayhead: this.setPlayhead,
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}