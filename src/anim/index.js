import React from 'react';
import clamp from 'lodash/clamp';
import { lerp } from './utils/interpolate';
import { getPointAtTime } from './utils/easing';
import {
  MIN_TIME_DIFF,
  MIN_DURATION_MS,
  MAX_DURATION_MS
} from './constants';

import ContextField from '@sqs/core-components/fields/ContextField';
import Button from '@sqs/core-components/fields/ButtonField';
import BooleanField from '@sqs/core-components/fields/BooleanField';
import Disclosure from '@sqs/core-components/fields/DisclosureField';
import NumberField from '@sqs/core-components/fields/NumberField';

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


const GRID_PX = 11;
const BORDER_RADIUS_PX = 4;

const BG_COLOR = '#f2f2f2';

const STAGE_BG_COLOR = 'white';
const STAGE_BORDER_COLOR = '#d0d0d0';

const CONTROLS_BG_COLOR = 'white';
const CONTROLS_BORDER_COLOR = '#d0d0d0';

const ANIMATIONS_BG_COLOR = 'white';
const ANIMATIONS_BORDER_COLOR = '#d0d0d0';

const PLAYHEAD_BG_COLOR = 'white';
const PLAYHEAD_BORDER_COLOR = '#d0d0d0';

const TIMELINE_LABEL_PX = 160;

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
const INIT_TWEENS_ADDED = [
  //INIT_AVAILABLE_TWEENS.pop()
];

const StoreContext = React.createContext();
class Store extends React.Component {
  state = {
    duration: 3000,
    isLooping: true,
    isPlaying: false,
    isReversed: false,
    tweensAvailable: INIT_AVAILABLE_TWEENS,
    tweensAdded: INIT_TWEENS_ADDED,
    playhead: 0,

    animations: [
      {
        id: 9999999,
        baseStyle: {},
        tweens: [...INIT_TWEENS_ADDED]
      }
    ],
    selectedAnimation: null,
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

  addTween = id => {
    const { tweensAdded, tweensAvailable } = this.state;
    const index = tweensAvailable.findIndex(t => t.id === id);
    if (index !== -1) {
      this.setState({
        tweensAdded: immutable.push(tweensAdded, tweensAvailable[index]),
        //tweensAvailable: immutable.removeAtIndex(tweensAvailable, index)
      });
    }
  };

  removeTween = id => {
    const { tweensAdded, tweensAvailable } = this.state;
    const index = tweensAdded.findIndex(t => t.id === id);
    if (index !== -1) {
      this.setState({
        tweensAdded: immutable.removeAtIndex(tweensAdded, index),
        //tweensAvailable: immutable.push(tweensAvailable, tweensAdded[index])
      })
    }
  };

  setDuration = (duration) => {
    if (duration >= MIN_DURATION_MS && duration <= MAX_DURATION_MS) {
      this.setState({ duration })
    }
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

  setTweenFromTime = (id, fromTime) => {
    const tween = this.state.tweensAdded.find(t => t.id === id);
    if (tween) {
      tween.fromTime = clamp(fromTime, 0, tween.toTime - MIN_TIME_DIFF);
      this.forceUpdate();
    }
  };

  setTweenToTime = (id, toTime) => {
    const tween = this.state.tweensAdded.find(t => t.id === id);
    if (tween) {
      tween.toTime = clamp(toTime, tween.fromTime + MIN_TIME_DIFF, 1);
      this.forceUpdate();
    }
  };

  setTweenPosition = (id, fromTime) => {
    const tween = this.state.tweensAdded.find(t => t.id === id);
    if (tween) {
      const diff = tween.toTime - tween.fromTime;
      fromTime = clamp(fromTime, 0, 1 - diff);

      tween.fromTime = fromTime;
      tween.toTime = fromTime + diff;
      this.forceUpdate();
    }
  }

  addAnimation = () => {
    const id = this.nextAnimationId++;

    const { animations } = this.state;
    this.setState({
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
      const { animations, selectedAnimation } = this.state;
      this.setState({
        animations: immutable.removeAtIndex(animations, index),
        selectedAnimation: selectedAnimation === anim ?
          animations[index] || null :
          selectedAnimation
      })
    }
  }

  setSelectedAnimation = animId => {
    const [anim, index] = this._findAnimation(animId);
    if (anim) {
      this.setState({ selectedAnimation: anim })
    }
  }

  getUnusedTweensForAnimation = animId => {
    const [anim, index] = this._findAnimation(animId);

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

      // this.setState({
      //   animations: immutable.updateAtIndex(animations, index, {
      //     ...animations[index],
      //     tweens: immutable.push(animations[index].tweens, tween)
      //   })
      // })
    }
  }

  render() {
    return (
      <StoreContext.Provider
        value={{
          ...this.state,
          addTween: this.addTween,
          removeTween: this.removeTween,
          setTweenFromTime: this.setTweenFromTime,
          setTweenToTime: this.setTweenToTime,
          setTweenPosition: this.setTweenPosition,
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
          getUnusedTweensForAnimation: this.getUnusedTweensForAnimation,
          addTweenToAnimation: this.addTweenToAnimation
        }}
      >
        {this.props.children}
      </StoreContext.Provider>
    );
  }
}

const DragContext = React.createContext();
class Drag extends React.Component {
  static Consumer = DragContext.Consumer;

  state = {
    isDragging: false,
    target: null,
  }

  onDragStart = (e, onUpdate) => {
    if (this.state.isDragging) return;

    const { pageX, pageY, target } = e;
    this.setState({
      onUpdate,
      isDragging: true,
      deltaX: 0,
      deltaY: 0,
      startX: pageX,
      startY: pageY,
      pageX,
      pageY,
      target: target
    }, () => {
      document.addEventListener('mousemove', this.onMouseMove, false);
      document.addEventListener('mouseup', this.onMouseUp, false);
    });
  };

  onMouseMove = e => {
    if (!this.state.isDragging) return;

    const { pageX, pageY } = e;
    const { onUpdate, startX, startY } = this.state;

    const nextState = {
      pageX,
      pageY,
      deltaX: pageX - startX,
      deltaY: pageY - startY
    }

    onUpdate({ ...this.state, ...nextState })
    this.setState(nextState);
  }

  onMouseUp = e => {
    if (!this.state.isDragging) return;

    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);
    this.setState({
      onUpdate: null,
      isDragging: false,
      target: null
    });
  }

  render() {
    return (
      <DragContext.Provider
        value={{
          onDragStart: (e, onUpdate) => this.onDragStart(e, onUpdate)
        }}
      >
        {this.props.children}
      </DragContext.Provider>
    );
  }
}

class Hover extends React.Component {
  state = { isHovering: false }
  onMouseEnter = () => this.setState({ isHovering: true });
  onMouseLeave = () => this.setState({ isHovering: false });

  captureRef = ref => {
    if (ref) {
      this.ref = ref;
      this.ref.addEventListener('mouseenter', this.onMouseEnter, false);
      this.ref.addEventListener('mouseleave', this.onMouseLeave, false);
    }
  }

  componentWillUnmount() {
    if (this.ref) {
      this.ref.removeEventListener('mouseenter', this.onMouseEnter, false);
      this.ref.removeEventListener('mouseleave', this.onMouseLeave, false);
    }
  }

  render() {
    return this.props.children({
      captureRef: this.captureRef,
      isHovering: this.state.isHovering
    })
  }
}

const TweenList = ({ label, leftArrow, onClick, style, tweens }) => (
  <div style={{ ...style }}>
    <ContextField label={label} fieldIndex={0} />
    <div style={{ backgroundColor: 'white' }}>
      {tweens.map(tween => (
        <Disclosure
          key={tween.id}
          hoverable
          accessoryReducer={Accessory => (
            <div style={leftArrow ? { transform: 'scaleX(-1)' } : undefined}>
              <Accessory />
            </div>
          )}
          label={tween.id}
          onClick={() => onClick(tween.id)}
        />
      ))}
    </div>
  </div>
);

const TimelineLabel = ({ children, style }) => (
  <div
    style={{
      width: TIMELINE_LABEL_PX,
      backgroundColor: '#dedede',
      ...style
    }}
  >
    {children}
  </div>
)

const TweenContainer = React.forwardRef(
  ({ children, style }, ref) => (
    <div
      ref={ref}
      style={{
        position: 'relative',
        height: 20,
        backgroundColor: '#ffffff',
        ...style
      }}
    >
      {children}
    </div>
  )
);

const TweenHandle = ({ index, onMouseDown }) => (
  <Drag.Consumer>
    {({ isDragging }) => (
      <div
        onMouseDown={onMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          left: index === 0 ? -0 : undefined,
          right: index === 1 ? -0 : undefined,
          width: 8,
          height: '100%',
          cursor: 'col-resize',
          backgroundColor: isDragging ? 'red' : 'dodgerblue'
        }}
      ></div>
    )}
  </Drag.Consumer>
);

const TweenBar = React.forwardRef(
  ({ children, fromTime, onMouseDown, toTime }, ref) => (
    <div
    style={{
      position: 'absolute',
      top: 0,
      left: `${fromTime * 100}%`,
      right: `${(1 - toTime) * 100}%`,
      height: '100%'
    }}
      onMouseDown={onMouseDown}
      >
      <Hover>
        {({ captureRef, isHovering }) => (
          <div
            ref={r => {
              captureRef(r);
              ref(r);
            }}
            style={{
              height: '100%',
              backgroundColor: isHovering ? '#333333' : 'black',
            }}
          />
        )}
      </Hover>
      {children}
    </div>
  )
);

class TweenTimeline extends React.Component {
  captureRef = ref => {
    this.containerRef = ref;
  };

  captureBarRef = ref => {
    this.barRef = ref;
  }

  renderHandle(index, onDragStart) {
    const { id } = this.props;

    return (
      <Store.Consumer>
        {({ setTweenFromTime, setTweenToTime }) => (
          <TweenHandle
            index={index}
            onMouseDown={e => {
              if (!this.containerRef) return;

              const rect = this.containerRef.getBoundingClientRect();

              onDragStart(e, ({ pageX }) => {
                const ratio = clamp((pageX - rect.left) / rect.width, 0, 1);

                const setHandleTime = index === 0 ? setTweenFromTime : setTweenToTime;
                setHandleTime(id, ratio);
              })
            }}
          />
        )}
      </Store.Consumer>
    );
  }

  render() {
    const {
      fromTime,
      toTime,
      id,
      style
    } = this.props;

    return (
      <TweenContainer style={style} ref={this.captureRef}>
        <Store.Consumer>
          {({ setTweenPosition }) => (
            <Drag.Consumer>
              {({ onDragStart }) => (
                <TweenBar
                  ref={this.captureBarRef}
                  fromTime={fromTime}
                  toTime={toTime}
                  onMouseDown={e => {
                    if (e.target !== this.barRef) return;
                    if (!this.containerRef || !this.barRef) return;

                    const rect = this.containerRef.getBoundingClientRect();
                    const barRect = this.barRef.getBoundingClientRect();

                    const initRatio = (barRect.left - rect.left) / rect.width;

                    onDragStart(e, ({ deltaX }) => {
                      const ratio = clamp(initRatio + deltaX / rect.width, 0, 1);
                      setTweenPosition(id, ratio);
                    })
                  }}
                >
                  {this.renderHandle(0, onDragStart)}
                  {this.renderHandle(1, onDragStart)}
                </TweenBar>
              )}
            </Drag.Consumer>
          )}
        </Store.Consumer>
      </TweenContainer>
    );
  }
}

const Playhead = props => (
  <Store.Consumer>
    {({ playhead, setPlayhead }) => (
      <input
        {...props}
        min={0}
        max={1}
        onChange={e => setPlayhead(parseFloat(e.target.value))}
        step={MIN_TIME_DIFF}
        type="range"
        value={playhead}
      />
    )}
  </Store.Consumer>
)

const PlayheadTime = props => (
  <Store.Consumer>
    {({ playhead }) => (
      <div {...props}>{playhead}</div>
    )}
  </Store.Consumer>
)

const Stage = ({ children, style }) => (
  <div style={{
    position: 'relative',
    border: `1px solid ${STAGE_BORDER_COLOR}`,
    backgroundColor: STAGE_BG_COLOR,
    borderRadius: BORDER_RADIUS_PX,
    height: 500,
    ...style
  }}>
    {children}
  </div>
)

const AnimTarget = ({ anim }) => (
  <Store.Consumer>
    {({ playhead }) => (
      <div style={{
        position: 'absolute',
        width: 30,
        height: 30,
        backgroundColor: 'blue',
        ...anim.tweens.reduce((style, tween) => {
          const {
            id,
            fromTime,
            fromValue,
            toTime,
            toValue
          } = tween;

          let value;
          if (playhead <= fromTime) {
            value = fromValue;
          } else if (playhead >= toTime) {
            value = toValue;
          } else {
            // interpolate
            const scaledTime = (playhead - fromTime) / (toTime - fromTime);
            const [_, curvedTime] = getPointAtTime(scaledTime, tween.easing);
            value = lerp(fromValue, toValue, curvedTime, tween.type);
          }
          
          style[id] = value;
          return style;
        }, {})
      }}></div>
    )}
  </Store.Consumer>
)

// PLAY PAUSE CONTROLS
const MediaControls = props => (
  <Store.Consumer>
    {({ duration, isLooping, isReversed, isPlaying, playhead, setDuration, setLooping, setReversed, setPaused, setPlaying, setStopped }) => (
      <div
        style={{
          backgroundColor: CONTROLS_BG_COLOR,
          border: `1px solid ${CONTROLS_BORDER_COLOR}`,
          borderRadius: BORDER_RADIUS_PX,
          paddingTop: GRID_PX
        }}
      >
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <Button
              inverted
              size="small"
              isDisabled={isPlaying}
              label="Play"
              onClick={setPlaying}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Button
              inverted
              size="small"
              isDisabled={!isPlaying}
              label="Pause"
              onClick={setPaused}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Button
              inverted
              size="small"
              isDisabled={playhead === 0}
              label="Stop"
              onClick={setStopped}
            />
          </div>
        </div>

        <NumberField
          label="Duration"
          min={MIN_DURATION_MS}
          max={MAX_DURATION_MS}
          onChange={setDuration}
          value={duration}
        />

        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, marginRight: GRID_PX }}>
            <BooleanField
              label="Loop"
              onChange={setLooping}
              value={isLooping}
              underlined={false}
            />
          </div>
          <div style={{ flex: 1 }}>
            <BooleanField
              label="Reverse"
              onChange={setReversed}
              value={isReversed}
              underlined={false}
            />
          </div>
        </div>
      </div>
    )}
  </Store.Consumer>
)

/*

*/

class App extends React.Component {
  render() {
    return (
      <div
        style={{
          backgroundColor: BG_COLOR,
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div>
          <div style={{ display: 'flex', padding: GRID_PX }}>

            {/* LEFT OF STAGE */}
            <div style={{ width: 600, paddingRight: GRID_PX, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

              <div style={{ display: 'flex' }}>
                <Store.Consumer>
                  {({ selectedAnimation, getUnusedTweensForAnimation, addTweenToAnimation, addTween, removeTween, tweensAvailable, tweensAdded }) =>
                    selectedAnimation && (console.log('redraw', selectedAnimation.tweens) || (
                      <>
                        <TweenList
                          label="Available"
                          onClick={id => addTweenToAnimation(selectedAnimation.id, id)}
                          tweens={getUnusedTweensForAnimation(selectedAnimation.id)}
                          style={{ flex: 1, marginRight: GRID_PX }}
                        />
                        <TweenList
                          label="Added"
                          leftArrow={true}
                          onClick={id => removeTween(id)}
                          tweens={selectedAnimation.tweens}
                          style={{ flex: 1 }}
                        />
                      </>
                    ))
                  }
                </Store.Consumer>
              </div>

              <MediaControls />

            </div>

            {/* STAGE AREA */}
            <div style={{ flex: 1 }}>
              <Store.Consumer>
                {({ animations }) => (
                  <Stage>
                    {animations.map(anim => (
                      <AnimTarget
                        key={anim.id}
                        anim={anim}
                      />
                    ))}
                  </Stage>
                )}
              </Store.Consumer>
              
              <div style={{ paddingTop: GRID_PX }}>
                <Store.Consumer>
                  {({ addAnimation }) => (
                    <Button
                      inverted
                      flush
                      size="small"
                      label="Add Animation"
                      onClick={addAnimation}
                    />
                  )}
                </Store.Consumer>
              </div>
            </div>

          </div>
        </div>

        <div
          style={{
            position: 'relative',
            flex: 1,
            overflowY: 'scroll',
            overflowX: 'hidden',
            backgroundColor: ANIMATIONS_BG_COLOR,
            borderTop: `1px solid ${ANIMATIONS_BORDER_COLOR}`
          }}
        >
          <Store.Consumer>
            {({ animations, playhead, setSelectedAnimation, selectedAnimation }) => (
              <>
                <div style={{ position: 'absolute', left: TIMELINE_LABEL_PX, right: 0, top: 0, bottom: 0 }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      width: 1,
                      backgroundColor: 'black',
                      left: `${playhead * 100}%`
                    }}
                  />
                </div>

                {animations.map(anim => (
                  <div
                    key={anim.id}
                    style={{
                      backgroundColor: anim === selectedAnimation ? 'yellow' : undefined
                    }}
                    onClick={() => setSelectedAnimation(anim.id)}
                  >
                    <ContextField label={`Animation #${anim.id}`} />
                    {anim.tweens.map(tween => (
                      <div
                        key={tween.id}
                        style={{
                          display: 'flex'
                        }}
                      >
                        <TimelineLabel>
                          <span>{tween.id}</span>
                        </TimelineLabel>
                        <TweenTimeline
                          key={tween.id}
                          id={tween.id}
                          fromTime={tween.fromTime}
                          toTime={tween.toTime}
                          style={{ flex: 1 }}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </Store.Consumer>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 40,
            backgroundColor: PLAYHEAD_BG_COLOR,
            borderTop: `1px solid ${PLAYHEAD_BORDER_COLOR}`
          }}
        >
          <PlayheadTime style={{ textAlign: 'center', width: TIMELINE_LABEL_PX, overflow: 'hidden' }} />
          <Playhead style={{ flex: 1 }} />
        </div>


      </div>
    );
  }
}

export default props => (
  <Store>
    <Drag>
      <App {...props} />
    </Drag>
  </Store>
);
