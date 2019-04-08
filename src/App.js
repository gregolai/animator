import React, { Component } from 'react';

const INIT_AVAILABLE_TWEENS = [
  {
    id: 'left',
    fromValue: 0,
    toValue: 100,
    min: 0,
    max: 500,
    type: 'number'
  },
  {
    id: 'top',
    fromValue: 0,
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
  }

  onChange = nextState => this.setState(nextState);

  render() {
    return (
      <StoreContext.Provider
        value={{
          ...this.state,
          addTween: this.addTween,
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



const CSS_PROPS = [
  {
    id: 'left',
    init: [0, 100],
    min: 0,
    max: 500,
    type: 'number'
  },
  {
    id: 'top',
    init: [0, 100],
    min: 0,
    max: 500,
    type: 'number'
  }
];

class Terminal extends React.Component {
  render() {
    const { onChange, propKey, time, value } = this.props;
    const { min, max, type } = CSS_PROPS.find(p => p.id === propKey);

    return (
      <div>
        {time === 0 ? 'from' : 'to'}
        <input
          max={max}
          min={min}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{ display: 'block', width: 100 }}
          type={type}
          value={value}
        />
      </div>
    )
  }
}

class PropList extends React.Component {
  render() {
    const {
      exclude,
      list,
      onSelect,
      selected
    } = this.props;

    const resolvedList = list.filter(id => exclude.indexOf(id) === -1);

    return (
      <div style={{ flex: 1, border: '1px solid black', backgroundColor: 'white', width: 100 }}>
        {resolvedList.map(id => (
          <Hover>
            {({ ref, isHovering }) => (
              <button
                key={id}
                ref={ref}
                onClick={() => onSelect(id)}
                style={{
                  width: '100%',
                  display: 'block',
                  border: id === selected ? '4px solid black' : '4px solid transparent',
                  backgroundColor: isHovering ? 'orange' : 'white'
                }}
              >{id}</button>
            )}
          </Hover>
        ))}
      </div>
    )
  }
}

const TweenList = props => (
  <div>
    {props.tweens.map(tween => (
      <Hover>
        {({ ref, isHovering }) => (
          <div
            key={tween.id}
            ref={ref}
            style={{ position: 'relative' }}
          >
            <span>{tween.id}</span>
            {isHovering && props.renderHover(tween.id)}
          </div>
        )}
      </Hover>
    ))}
  </div>
);

class Tween extends React.Component {
  render() {
    const {
      id,
      leftRatio,
      rightRatio
    } = this.props;

    const widthRatio = rightRatio - leftRatio;

    return (
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 30,
        borderBottom: '1px solid black'
      }}>
        <div style={{
          height: '100%',
          width: 100,
          textAlign: 'right'
        }}>{id}</div>
        <div style={{
          borderLeft: '1px solid black',
          flex: 1,
          height: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'relative',
            backgroundColor: 'black',
            left: `${leftRatio * 100}%`,
            width: `${widthRatio * 100}%`,
            height: '100%'
          }} />
        </div>
      </div>
    )
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

class App extends Component {

  state = {
    selectedProp: 'left',
    tweens: [
      ['left', 20, 80],
      //top: [20, 160]
    ]
  }

  render() {
    const {
      selectedProp,
      tweens
    } = this.state;

    const selectedTween = selectedProp ?
      tweens.find(t => t[0] === selectedProp) :
      null;

    return (
      <div>

        <div style={{ display: 'flex', height: 400 }}>

          <div style={{ height: '100%' }}>
            <div style={{ display: 'flex', height: 200 }}>
              <PropList
                exclude={tweens.map(v => v[0])}
                list={CSS_PROPS.map(p => p.id)}
                onSelect={id => {
                  const prop = CSS_PROPS.find(p => p.id === id);

                  this.setState({
                    tweens: [
                      ...tweens,
                      [id, prop.init[0], prop.init[1]]
                    ]
                  })
                }}
                selected={null}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <PropList
                  exclude={[]}
                  list={tweens.map(v => v[0])}
                  onSelect={id => this.setState({ selectedProp: id })}
                  selected={selectedProp}
                />
                <button
                  onClick={() => {
                    tweens.splice(
                      tweens.findIndex(t => t[0] === selectedProp),
                      1
                    );
                    this.forceUpdate();
                  }}
                  style={{ width: '100%' }}
                >&lt;&lt;</button>
              </div>

            </div>

            <div>
              {selectedTween && (
                <div>
                  <Terminal
                    onChange={v => {
                      selectedTween[1] = v;
                      this.forceUpdate();
                    }}
                    propKey={selectedProp}
                    time={0}
                    value={selectedTween[1]}
                  />
                  <Terminal
                    onChange={v => {
                      selectedTween[2] = v;
                      this.forceUpdate();
                    }}
                    propKey={selectedProp}
                    time={1}
                    value={selectedTween[2]}
                  />
                </div>
              )}
            </div>
          </div>


          <div style={{ position: 'relative', height: '100%', backgroundColor: 'white' }}>
            <AnimTarget />
          </div>
        </div>

        {tweens.map(tween => (
          <Tween
            id={tween[0]}
            leftRatio={0.2}
            rightRatio={0.8}
          />
        ))}

        <div style={{ display: 'flex', marginLeft: 100, }}>
          <PlayheadTime style={{ textAlign: 'center', width: 100 }} />
          <Playhead style={{ flex: 1 }} />
        </div>

        <div style={{ width: 200 }}>
          <AvailableTweens />
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
