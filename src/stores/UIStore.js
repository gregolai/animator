import { React, normalizeRatio, roundToInterval, INTERVAL_MS } from 'common';
import { createPersist } from 'utils/persist';

const persist = createPersist('UIStore', {
  expandedTweenId: -1,
  hiddenTweens: {},
  lockedTweens: {},
  selectedInstanceId: -1,

  // MEDIA
  isLooping: true,
  isReversed: false,
  playhead: 0,
  tickSpacing: 4
});

const Context = React.createContext();
export default class UIStore extends React.Component {
  static Consumer = Context.Consumer;

  state = {
    expandedTweenId: persist.expandedTweenId.read(),
    hiddenTweens: persist.hiddenTweens.read(),
    lockedTweens: persist.lockedTweens.read(),
    selectedInstanceId: persist.selectedInstanceId.read(),

    // MEDIA
    isLooping: persist.isLooping.read(),
    isPlaying: false,
    isReversed: persist.isReversed.read(),
    localPlayhead: { animationId: -1, time: 0 },
    playhead: persist.playhead.read(),
    tickSpacing: persist.tickSpacing.read()
  };

  constructor(props) {
    super(props);

    this._controls = (() => {
      let raf = null;
      let prevTime;

      const loop = () => {
        const curTime = Date.now();

        const timeStep = curTime - prevTime;

        let stop = false;
        let nextPlayhead = this.state.playhead + (this.state.isReversed ? -timeStep : timeStep);

        const DURATION = 99999;
        if (nextPlayhead >= DURATION) {
          if (this.state.isLooping) {
            nextPlayhead -= DURATION; // loop
          } else {
            nextPlayhead = DURATION; // clamp
            stop = true;
          }
        } else if (nextPlayhead < 0) {
          if (this.state.isLooping) {
            nextPlayhead += DURATION; // loop
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
      };

      return {
        play: () => {
          if (this.state.isPlaying) return;

          let { playhead } = this.state;

          // reset if necessary
          if (!this.state.isReversed && playhead === 1) {
            playhead = 0;
          } else if (this.state.isReversed && playhead === 0) {
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
      };
    })();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = e => {
    const excludeTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    if (e.target && excludeTags.indexOf(e.target.tagName) !== -1) {
      return;
    }

    switch (e.code) {
      case 'Enter':
      case 'Space':
        e.preventDefault();
        this.state.isPlaying ? this.setPaused() : this.setPlaying();
        break;
      case 'Backspace':
        e.preventDefault();
        this.setStopped();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.setPlayhead(e.metaKey ? 1 : this.state.playhead + INTERVAL_MS);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.setPlayhead(e.metaKey ? 0 : this.state.playhead - INTERVAL_MS);
        break;
      case 'End':
        e.preventDefault();
        // this.setPlayhead(this.state.duration);
        break;
      case 'Home':
        e.preventDefault();
        this.setPlayhead(0);
        break;
      case 'KeyR':
        if (!e.metaKey) {
          e.preventDefault();
          this.setReversed(!this.state.isReversed);
        }
        break;
      case 'KeyL':
        e.preventDefault();
        this.setLooping(!this.state.isLooping);
        break;
      case 'Backquote':
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4':
      case 'Digit5':
      case 'Digit6':
      case 'Digit7':
      case 'Digit8':
      case 'Digit9':
      case 'Digit0':
        e.preventDefault();

        // const time =
        //   e.code === 'Digit0'
        //     ? this.state.duration
        //     : e.code === 'Backquote'
        //       ? 0
        //       : (parseInt(e.code.replace('Digit', '')) / INTERVAL_MS) * this.state.duration;
        // this.setPlayhead(time);
        break;
      default:
    }
  };

  setSelectedInstance = instanceId => {
    const selectedInstanceId = instanceId;

    this.setState({ selectedInstanceId });
    persist.selectedInstanceId.write(selectedInstanceId);
  };

  isTweenExpanded = tweenId => {
    return this.state.expandedTweenId === tweenId;
  };

  setTweenExpanded = (tweenId, expand) => {
    const expandedTweenId = expand ? tweenId : -1;

    this.setState({ expandedTweenId });
    persist.expandedTweenId.write(expandedTweenId);
  };

  isTweenHidden = tweenId => {
    return !!this.state.hiddenTweens[tweenId];
  };

  setTweenHidden = (tweenId, hide) => {
    const hiddenTweens = { ...this.state.hiddenTweens };

    if (hide) {
      hiddenTweens[tweenId] = true;
    } else {
      delete hiddenTweens[tweenId];
    }

    this.setState({ hiddenTweens });
    persist.hiddenTweens.write(hiddenTweens);
  };

  isTweenLocked = tweenId => {
    return !!this.state.lockedTweens[tweenId];
  };

  setTweenLocked = (tweenId, lock) => {
    const lockedTweens = { ...this.state.lockedTweens };

    if (lock) {
      lockedTweens[tweenId] = true;
    } else {
      delete lockedTweens[tweenId];
    }

    this.setState({ lockedTweens });
    persist.lockedTweens.write(lockedTweens);
  };

  setLooping = isLooping => {
    this.setState({ isLooping });
    persist.isLooping.write(isLooping);
  };

  setReversed = isReversed => {
    this.setState({ isReversed });
    persist.isReversed.write(isReversed);
  };

  setPlaying = () => {
    this._controls.play();
  };

  setPaused = () => {
    this._controls.pause();
  };

  setStopped = () => {
    this._controls.stop();
  };

  setPlayhead = time => {
    const playhead = Math.max(time, 0);

    this.setState({ playhead });
    persist.playhead.write(playhead);
  };

  setTickSpacing = tickSpacing => {
    tickSpacing = Math.max(1, tickSpacing);

    this.setState({ tickSpacing });
    persist.tickSpacing.write(tickSpacing);
  };

  setLocalPlayhead = (animationId, time) => {
    time = normalizeRatio(time);

    this.setState({
      localPlayhead: { animationId, time }
    });
  };

  getLocalPlayhead = (animationId) => {
    const { localPlayhead } = this.state;
    return localPlayhead.animationId === animationId ? localPlayhead.time : undefined;
  }

  render() {
    const { isLooping, isPlaying, isReversed, playhead, tickSpacing } = this.state;

    return (
      <Context.Provider
        value={{
          selectedInstanceId: this.state.selectedInstanceId,
          setSelectedInstance: this.setSelectedInstance,

          isTweenExpanded: this.isTweenExpanded,
          setTweenExpanded: this.setTweenExpanded,

          isTweenHidden: this.isTweenHidden,
          setTweenHidden: this.setTweenHidden,

          isTweenLocked: this.isTweenLocked,
          setTweenLocked: this.setTweenLocked,


          isLooping,
          isPlaying,
          isReversed,
          playhead,
          tickSpacing,

          setLooping: this.setLooping,
          setReversed: this.setReversed,
          setPlaying: this.setPlaying,
          setPaused: this.setPaused,
          setStopped: this.setStopped,
          setPlayhead: this.setPlayhead,
          setTickSpacing: this.setTickSpacing,


          setLocalPlayhead: this.setLocalPlayhead,
          getLocalPlayhead: this.getLocalPlayhead
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}
