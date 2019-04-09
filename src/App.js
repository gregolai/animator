import React from 'react';

const getEasingArray = (() => {
  /**
   * Cubic bezier equivalents:
   * https://www.w3.org/TR/css-easing-1/#typedef-cubic-bezier-timing-function
   */
  const EASING_MAP = {
    linear: [0.5, 0.5, 0.5, 0.5],
    ease: [0.25, 0.1, 0.25, 1],
    'ease-in': [0.42, 0, 1, 1],
    'ease-out': [0, 0, 0.58, 1],
    'ease-in-out': [0.42, 0, 0.58, 1]
  };

  return (easing) => {
    return Array.isArray(easing) ?
      easing :
      EASING_MAP[easing] || EASING_MAP.linear;
  };
})();

const clamp = (v, min, max) => Math.max(Math.min(v, max), min);

const MIN_TIME_DIFF = 0.01;

const INIT_AVAILABLE_TWEENS = [
  {
    id: 'left',
    fromTime: 0,
    fromValue: 0,
    toTime: 1,
    toValue: 100,
    min: 0,
    max: 500,
    type: 'number'
  },
  {
    id: 'top',
    fromTime: 0.4,
    fromValue: 0,
    toTime: 0.8,
    toValue: 100,
    min: 0,
    max: 500,
    type: 'number'
  }
]
const INIT_TWEENS_ADDED = [
  INIT_AVAILABLE_TWEENS.pop()
];

const StoreContext = React.createContext();
class Store extends React.Component {
  state = {
    tweensAvailable: INIT_AVAILABLE_TWEENS,
    tweensAdded: INIT_TWEENS_ADDED,
    selectedTween: null,
    playhead: 0,
  }

  static Consumer = StoreContext.Consumer;

  addTween = id => {
    const index = this.state.tweensAvailable.findIndex(t => t.id === id);
    if (index !== -1) {
      const [toAdd] = this.state.tweensAvailable.splice(index, 1);
      this.state.tweensAdded.push(toAdd);
      this.forceUpdate();
    }
  };

  removeTween = id => {
    const index = this.state.tweensAdded.findIndex(t => t.id === id);
    if (index !== -1) {
      const [toRemove] = this.state.tweensAdded.splice(index, 1);
      this.state.tweensAvailable.push(toRemove);
      this.forceUpdate();
    }
  };

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

  onChange = nextState => this.setState(nextState);

  render() {
    return (
      <StoreContext.Provider
        value={{
          ...this.state,
          addTween: this.addTween,
          removeTween: this.removeTween,
          onChange: this.onChange,
          setTweenFromTime: this.setTweenFromTime,
          setTweenToTime: this.setTweenToTime,
          setTweenPosition: this.setTweenPosition
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

const TweenList = ({ label, tweens, renderHover }) => (
  <div>
    <h3>{label}</h3>
    <div style={{ backgroundColor: '#dedede', width: 200 }}>
      {tweens.map(tween => (
        <Hover key={tween.id}>
          {({ captureRef, isHovering }) => (
            <div
              key={tween.id}
              ref={captureRef}
              style={{
                position: 'relative',
                padding: 8,
                backgroundColor: isHovering ? '#ffffff' : undefined
              }}
            >
              <span style={{ display: 'block', textAlign: 'center' }}>{tween.id}</span>
              {isHovering && renderHover(tween.id)}
            </div>
          )}
        </Hover>
      ))}
    </div>
  </div>
);

const TimelineLabel = ({ children, style }) => (
  <div style={{ width: 100, backgroundColor: '#dedede', ...style }}>
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
  <Store.Consumer>
    {({ setTweenFromTime, setTweenToTime }) => (
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
    )}
  </Store.Consumer>
);

const TweenBar = React.forwardRef(
  ({ children, fromTime, onMouseDown, toTime }, ref) => (
    <div
      ref={ref}
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
            ref={captureRef}
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
    {({ playhead, onChange }) => (
      <input
        {...props}
        min={0}
        max={1}
        onChange={
          e => onChange({ playhead: parseFloat(e.target.value) })
        }
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

const AnimTarget = props => (
  <Store.Consumer>
    {({ playhead, tweensAdded }) => (
      <div style={{
        position: 'absolute',
        width: 30,
        height: 30,
        backgroundColor: 'blue',
        ...tweensAdded.reduce((style, tween) => {
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
            const totalTime = toTime - fromTime;
            const deltaTime = playhead - fromTime;
            const ratio = deltaTime / totalTime;
            value = fromValue + (ratio * (toValue - fromValue));
          }

          //style[id] = fromValue + (toValue - fromValue) * playhead; // lerp
          style[id] = value;
          return style;
        }, {})
      }}></div>
    )}
  </Store.Consumer>
)

const AvailableTweens = props => (
  <Store.Consumer>
    {({ addTween, tweensAvailable }) => (
      <TweenList
        label="Available"
        renderHover={(id) => (
          <button
            style={{ position: 'absolute', right: 0, top: 0, height: '100%' }}
            onClick={() => addTween(id)}
          >&gt;&gt;</button>
        )}
        tweens={tweensAvailable}
      />
    )}
  </Store.Consumer>
)

const AddedTweens = props => (
  <Store.Consumer>
    {({ removeTween, tweensAdded }) => (
      <TweenList
        label="Added"
        renderHover={(id) => (
          <button
            style={{ position: 'absolute', left: 0, top: 0, height: '100%' }}
            onClick={() => removeTween(id)}
          >&lt;&lt;</button>
        )}
        tweens={tweensAdded}
      />
    )}
  </Store.Consumer>
)

class App extends React.Component {
  render() {
    return (
      <div>

        <div style={{ display: 'flex', height: 400 }}>

          <div style={{ position: 'relative', height: '100%', backgroundColor: 'white' }}>
            <AnimTarget />
          </div>
        </div>

        <Store.Consumer>
          {({ tweensAdded }) => (
            <div>
              {tweensAdded.map(tween => (
                <div key={tween.id} style={{ display: 'flex' }}>
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
          )}
        </Store.Consumer>

        <div style={{ display: 'flex' }}>
          <PlayheadTime style={{ textAlign: 'center', width: 100 }} />
          <Playhead style={{ flex: 1 }} />
        </div>

        <div style={{ display: 'flex' }}>
          <AvailableTweens />
          <AddedTweens />
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
