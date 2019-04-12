import React from 'react';
import clamp from 'lodash/clamp';
import cssbeautify from 'cssbeautify';
import { lerp } from './utils/interpolate';
import { getPointAtTime } from './utils/easing';
import {
  MIN_TIME_DIFF,
  MIN_DURATION_MS,
  MAX_DURATION_MS
} from './constants';

import ContextField from '@sqs/core-components/fields/ContextField';
import ButtonField from '@sqs/core-components/fields/ButtonField';
import BooleanField from '@sqs/core-components/fields/BooleanField';
import Disclosure from '@sqs/core-components/fields/DisclosureField';
import NumberField from '@sqs/core-components/fields/NumberField';
import TextareaField from '@sqs/core-components/fields/TextareaField';

import Store from './Store';

const createCssFromAnimations = (anims) => {

  const animKeyframes = anims.map(anim => {
    if (anim.tweens.length === 0) return '';

    const percentGroups = {};

    const pushTimestamp = (id, time, value) => {
      const percent = Math.floor(time * 100);
      (percentGroups[percent] = percentGroups[percent] || []).push({ id, value });
    }

    anim.tweens.forEach(tween => {
      pushTimestamp(tween.id, tween.fromTime, tween.fromValue);
      pushTimestamp(tween.id, tween.toTime, tween.toValue);
    });

    const sorted = Object.entries(percentGroups)
      .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

    const writeProp = ({ id, value }) => `${id}: ${value};`;

    const writePercentGroup = (percent, group) => `${percent}% { ${group.map(writeProp).join(' ') } }`;

    return `@keyframes anim_${anim.id} { ${sorted.map(([percent, group]) => writePercentGroup(percent, group)).join(' ') } }`;
  });

  return cssbeautify(animKeyframes.join(' '), {
    indent: '  ',
    autosemicolon: true
  });
}

const GRID_PX = 11;
const BORDER_RADIUS_PX = 4;

const BG_COLOR = '#f2f2f2';
const BORDER_COLOR = '#d0d0d0';
const BORDER_COLOR_DARK = '#a1a1a1';

const STAGE_BG_COLOR = 'white';
const STAGE_BORDER_COLOR = '#d0d0d0';

const CONTROLS_BG_COLOR = 'white';
const CONTROLS_BORDER_COLOR = '#d0d0d0';

const ANIMATIONS_BG_COLOR = 'white';
const ANIMATIONS_BORDER_COLOR = '#d0d0d0';

const PLAYHEAD_BG_COLOR = 'white';
const PLAYHEAD_BORDER_COLOR = '#d0d0d0';

const TIMELINE_LABEL_PX = 160;

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

const TimelineLabel = ({ onClick, label, style }) => (
  <div
    style={{
      width: TIMELINE_LABEL_PX,
      backgroundColor: 'white',
      textAlign: 'right',
      ...style
    }}
  >
    <ButtonField
      flush
      alignment="right"
      label={label}
      onClick={onClick}
      size="small"
    />
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
    const { anim, tween } = this.props;

    return (
      <Store.Consumer>
        {({ setTweenHandle }) => (
          <TweenHandle
            index={index}
            onMouseDown={e => {
              if (!this.containerRef) return;

              const rect = this.containerRef.getBoundingClientRect();

              onDragStart(e, ({ pageX }) => {
                const ratio = clamp((pageX - rect.left) / rect.width, 0, 1);
                setTweenHandle(anim.id, tween.id, index, ratio);
              })
            }}
          />
        )}
      </Store.Consumer>
    );
  }

  render() {
    const {
      anim,
      tween,
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
                  fromTime={tween.fromTime}
                  toTime={tween.toTime}
                  onMouseDown={e => {
                    if (e.target !== this.barRef) return;
                    if (!this.containerRef || !this.barRef) return;

                    const rect = this.containerRef.getBoundingClientRect();
                    const barRect = this.barRef.getBoundingClientRect();

                    const initRatio = (barRect.left - rect.left) / rect.width;

                    onDragStart(e, ({ deltaX }) => {
                      const ratio = clamp(initRatio + deltaX / rect.width, 0, 1);
                      setTweenPosition(anim.id, tween.id, ratio);
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
      <div {...props}>{Number(playhead).toFixed(2)}</div>
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
            <ButtonField
              inverted
              size="small"
              isDisabled={isPlaying}
              label="Play"
              onClick={setPlaying}
            />
          </div>
          <div style={{ flex: 1 }}>
            <ButtonField
              inverted
              size="small"
              isDisabled={!isPlaying}
              label="Pause"
              onClick={setPaused}
            />
          </div>
          <div style={{ flex: 1 }}>
            <ButtonField
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

const PlayheadCursor = () => (
  <Store.Consumer>
    {({ playhead }) => (
      <div
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          left: TIMELINE_LABEL_PX,
          right: 0,
          top: 0,
          bottom: 0,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            zIndex: 1,
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: 'black',
            left: `${playhead * 100}%`
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 12,
              height: 12,
              backgroundColor: 'black',
              transform: 'translate(-6px, -6px) rotate(-45deg)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: 12,
              height: 12,
              backgroundColor: 'black',
              transform: 'translate(-6px, -6px) rotate(-45deg)'
            }}
          />
        </div>
      </div>
    )}
  </Store.Consumer>
)

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
        {/* TOP REGION */}
        <div>
          <div style={{ display: 'flex', padding: GRID_PX }}>

            {/* LEFT OF STAGE */}
            <div style={{ width: 600, paddingRight: GRID_PX, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

              <div style={{ display: 'flex' }}>
                <Store.Consumer>
                  {({ selectedAnimId, getAnimation, getUnusedTweens, addTweenToAnimation, removeTweenFromAnimation }) =>
                    selectedAnimId !== -1 && (
                      <>
                        <TweenList
                          label="Available"
                          onClick={id => addTweenToAnimation(selectedAnimId, id)}
                          tweens={getUnusedTweens(selectedAnimId)}
                          style={{ flex: 1, marginRight: GRID_PX }}
                        />
                        <TweenList
                          label="Added"
                          leftArrow={true}
                          onClick={id => removeTweenFromAnimation(selectedAnimId, id)}
                          tweens={getAnimation(selectedAnimId).tweens}
                          style={{ flex: 1 }}
                        />
                      </>
                    )
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
              
              <div style={{ display: 'flex', paddingTop: GRID_PX }}>
                <Store.Consumer>
                  {({ selectedAnimId, addAnimation, removeAnimation }) => (
                    <>
                      <div style={{ flex: 1 }}>
                        <ButtonField
                          inverted
                          size="small"
                          label="Add Animation"
                          onClick={addAnimation}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <ButtonField
                          inverted
                          isDisabled={selectedAnimId === -1}
                          size="small"
                          label="Remove Animation"
                          onClick={() => removeAnimation(selectedAnimId)}
                        />
                      </div>
                    </>
                  )}
                </Store.Consumer>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM REGION */}
        <div style={{ flex: 1, display: 'flex' }}>
          
          {/* LEFT BOTTOM REGION */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderTop: `1px solid ${BORDER_COLOR_DARK}`,
              borderRight: `1px solid ${BORDER_COLOR_DARK}`
            }}
          >

            {/* PLAYHEAD REGION */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 40,
                backgroundColor: PLAYHEAD_BG_COLOR,
                borderBottom: `1px solid ${PLAYHEAD_BORDER_COLOR}`
              }}
            >
              <PlayheadTime style={{ textAlign: 'center', width: TIMELINE_LABEL_PX, overflow: 'hidden' }} />
              <Playhead style={{ flex: 1 }} />
            </div>

            {/* TIMELINE REGION */}
            <div
              style={{
                position: 'relative',
                flex: 1,
                overflowY: 'scroll',
                overflowX: 'hidden',
                backgroundColor: ANIMATIONS_BG_COLOR
              }}
            >
              <Store.Consumer>
                {({ animations, playhead, selectedAnimId, setSelectedAnimation }) => (
                  <>
                    {/* PLAYHEAD LINE */}
                    <PlayheadCursor />

                    {animations.map((anim, animIndex) => (
                      <div
                        key={anim.id}
                        style={{
                          cursor: 'pointer',
                          paddingTop: GRID_PX * 3,
                          backgroundColor: anim.id === selectedAnimId ? '#ededed' : undefined,
                          borderBottom: `1px solid ${BORDER_COLOR}`
                        }}
                        onClick={() => setSelectedAnimation(anim.id)}
                      >
                        <div
                          
                        >
                          <ContextField label={`Animation #${anim.id}`} fieldIndex={0} />
                        </div>
                        <div style={{ paddingBottom: GRID_PX }} >
                          {anim.tweens.map((tween, tweenIndex) => (
                            <div
                              key={tween.id}
                              style={{
                                display: 'flex'
                              }}
                            >
                              <TimelineLabel
                                label={tween.id}
                                onClick={() => {}}
                              />
                              <TweenTimeline
                                anim={anim}
                                tween={tween}
                                style={{ flex: 1 }}
                                underlined={tweenIndex !== anim.tweens.length - 1}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </Store.Consumer>

            </div>

          </div>

          {/* GENERATED ANIMATION CSS */}
          <div style={{ width: 300 }}>
            <Store.Consumer>
              {({ animations }) => (
                <TextareaField value={createCssFromAnimations(animations)} />
              )}
            </Store.Consumer>
          </div>
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
