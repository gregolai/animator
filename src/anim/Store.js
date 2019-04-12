import React from 'react';
import clamp from 'lodash/clamp';

const immutable = {
  updateAtIndex: (array, index, item) => ([
    ...array.slice(0, index),
    item,
    ...array.slice(index + 1)
  ]),
  push: (array, item) => ([
    ...array,
    item
  ]),
  removeAtIndex: (array, index) => ([
    ...array.slice(0, index),
    ...array.slice(index + 1)
  ])
}

const createTween = ({
  id,
  from,
  to,
  type,
  ...extra
}) => ({
  id,
  easing: 'linear',
  fromTime: 0,
  fromValue: from,
  toTime: 1,
  toValue: to,
  type,
  ...extra
})

const INIT_AVAILABLE_TWEENS = [
  createTween({
    id: 'backgroundColor',
    type: 'color',
    fromValue: '#000000',
    toValue: '#ffffff',
    min: '#000000',
    max: '#ffffff'
  }),
  createTween({
    id: 'left',
    type: 'number',
    fromValue: 0,
    toValue: 200,
    min: 0,
    max: 500
  }),
  createTween({
    id: 'top',
    type: 'number',
    fromValue: 0,
    toValue: 200,
    min: 0,
    max: 500
  })


  // BorderColor,
  // BorderWidth,
  // Color,
  // ExpandHeight,
  // FontSize,
  // Margin,
  // Opacity,
  // Padding,
  // Rotate,
  // Scale,
  // Translate,
  // Transform
]


const StoreContext = React.createContext();
export default class Store extends React.Component {
  state = {
    duration: 3000,
    isLooping: true,
    isPlaying: false,
    isReversed: false,
    playhead: 0,

    animations: [],
    selectedAnimId: -1
  }

  nextAnimationId = 1000;

  static Consumer = StoreContext.Consumer;

  constructor(props) {
    super(props);

    this.playControls = (() => {

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

  _findAnimation = animId => {
    const index = this.state.animations.findIndex(a => a.id === animId);
    return [this.state.animations[index] || null, index];
  };

  _findTween = (anim, tweenId) => {
    const index = anim.tweens.findIndex(t => t.id === tweenId);
    return [anim.tweens[index] || null, index];
  };

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
    this.playControls.play();
  };

  setPaused = () => {
    this.playControls.pause();
  };

  setStopped = () => {
    this.playControls.stop();
  };

  setPlayhead = playhead => {
    playhead = clamp(playhead, 0, 1);
    this.setState({ playhead });
  }

  addAnimation = () => {
    const id = this.nextAnimationId++;

    let { animations, selectedAnimId } = this.state;

    if (selectedAnimId === -1) {
      selectedAnimId = id;
    }

    this.setState({
      selectedAnimId,
      animations: immutable.push(animations, {
        id,
        baseStyle: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: 100,
          height: 100,
          backgroundColor: 'blue'
        },
        tweens: []
      })
    });
  }

  removeAnimation = animId => {
    const [anim, index] = this._findAnimation(animId);
    if (anim) {
      let { animations, selectedAnimId } = this.state;

      // if removing selected, apply new selected
      if (animId === selectedAnimId) {
        const nextAnim = animations[index+1] || animations[index-1];
        selectedAnimId = nextAnim ? nextAnim.id : -1;
      }

      this.setState({
        animations: immutable.removeAtIndex(animations, index),
        selectedAnimId
      })
    }
  }

  setSelectedAnimation = animId => {
    const [anim, _] = this._findAnimation(animId);
    if (anim) {
      this.setState({ selectedAnimId: anim.id })
    }
  }

  getUnusedTweens = animId => {
    const [anim, _] = this._findAnimation(animId);

    let tweensUnused = INIT_AVAILABLE_TWEENS;
    if (anim) {
      tweensUnused = tweensUnused.filter(
        t1 => !anim.tweens.find(t2 => t2.id === t1.id)
      );
    }

    return tweensUnused;
  }

  addTweenToAnimation = (animId, tweenId) => {
    const [anim, index] = this._findAnimation(animId);
    if (anim) {
      const { animations } = this.state;

      const tween = {
        ...INIT_AVAILABLE_TWEENS.find(t => t.id === tweenId)
      };

      animations[index].tweens.push(tween);
      this.forceUpdate();
    }
  }

  removeTweenFromAnimation = (animId, tweenId) => {
    const [anim, _] = this._findAnimation(animId);
    if (anim) {
      const [tween, index] = this._findTween(anim, tweenId);
      if (tween) {
        anim.tweens.splice(index, 1);
        this.forceUpdate();
      }
    }
  }

  setTweenHandle = (animId, tweenId, handleIndex, value) => {
    const [anim, _] = this._findAnimation(animId);
    if (anim) {
      const [tween, _] = this._findTween(anim, tweenId);
      if (tween) {
        
        if (handleIndex === 0) {
          tween.fromTime = value;
        } else {
          tween.toTime = value;
        }
        this.forceUpdate();
      }
    }
  }

  setTweenPosition = (animId, tweenId, value) => {
    const [anim, _] = this._findAnimation(animId);
    if (anim) {
      const [tween, _] = this._findTween(anim, tweenId);
      if (tween) {
        const diff = tween.toTime - tween.fromTime;
        value = clamp(value, 0, 1 - diff);
  
        tween.fromTime = value;
        tween.toTime = value + diff;
        this.forceUpdate();
      }
    }
  }

  getAnimation = (animId) => {
    const [anim, _] = this._findAnimation(animId);
    return anim;
  }

  render() {
    return (
      <StoreContext.Provider
        value={{
          ...this.state,
          setDuration: this.setDuration,
          setLooping: this.setLooping,
          setReversed: this.setReversed,
          setPlaying: this.setPlaying,
          setPaused: this.setPaused,
          setStopped:  this.setStopped,
          setPlayhead: this.setPlayhead,
          
          addAnimation: this.addAnimation,
          removeAnimation: this.removeAnimation,
          setSelectedAnimation: this.setSelectedAnimation,
          getUnusedTweens: this.getUnusedTweens,
          addTweenToAnimation: this.addTweenToAnimation,
          removeTweenFromAnimation: this.removeTweenFromAnimation,
          setTweenHandle: this.setTweenHandle,
          setTweenPosition: this.setTweenPosition,
          getAnimation: this.getAnimation
        }}
      >
        {this.props.children}
      </StoreContext.Provider>
    );
  }
}
