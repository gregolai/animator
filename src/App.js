import React, { Component } from 'react';

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
    fromTime: 0,
    fromValue: 0,
    toTime: 1,
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


  onChange = nextState => this.setState(nextState);

  render() {
    return (
      <StoreContext.Provider
        value={{
          ...this.state,
          addTween: this.addTween,
          removeTween: this.removeTween,
          onChange: this.onChange
        }}
      >
        {this.props.children}
      </StoreContext.Provider>
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
    if(this.ref) {
      this.ref.removeEventListener('mouseenter', this.onMouseEnter, false);
      this.ref.removeEventListener('mouseleave', this.onMouseLeave, false);
    }
  }

  render() {
    return this.props.children({
      ref: this.captureRef,
      isHovering: this.state.isHovering
    })
  }
}

const TweenList = props => (
  <div>
    <h3>{props.label}</h3>
    <div style={{ backgroundColor: '#dedede', width: 200 }}>
      {props.tweens.map(tween => (
        <Hover key={tween.id}>
          {({ ref, isHovering }) => (
            <div
              key={tween.id}
              ref={ref}
              style={{
                position: 'relative',
                padding: 8,
                backgroundColor: isHovering ? '#ffffff' : undefined
              }}
            >
              <span style={{ display: 'block', textAlign: 'center' }}>{tween.id}</span>
              {isHovering && props.renderHover(tween.id)}
            </div>
          )}
        </Hover>
      ))}
    </div>
  </div>
);

const TimelineLabel = props => (
  <div style={{ width: 100, backgroundColor: '#dedede', ...props.style }}>
    {props.children}
  </div>
)

const TweenHandle = props => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: props.index === 0 ? -10 : undefined,
      right: props.index === 1 ? -10 : undefined,
      width: 20,
      height: '100%',
      backgroundColor: 'red'
    }}
  ></div>
);

const TweenTimeline = props => (
  <div style={{
    position: 'relative',
    height: 20,
    backgroundColor: '#ffffff',
    ...props.style
  }}>
    <Hover>
      {({ ref, isHovering }) => (
        <div
          ref={ref}
          style={{
            position: 'absolute',
            backgroundColor: isHovering ? '#333333' : 'black',
            top: 0,
            left: `${props.fromTime * 100}%`,
            right: `${(1 - props.toTime) * 100}%`,
            height: '100%'
          }}
        >
          {isHovering && (
            <TweenHandle id={props.id} index={0} />
          )}
          {isHovering && (
            <TweenHandle id={props.id} index={1} />
          )}
        </div>
      )}
    </Hover>
  </div>
);

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
        step={0.01}
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
          const { id, fromValue, toValue } = tween;
          style[id] = fromValue + (toValue - fromValue) * playhead;
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

class App extends Component {
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

        <div style={{ display: 'flex', marginLeft: 100, }}>
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
    <App {...props} />
  </Store>
);
