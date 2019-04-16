import React from 'react';
import clamp from 'lodash/clamp';
import last from 'lodash/last';
import cssbeautify from 'cssbeautify';
import { getPointAtTime } from './utils/easing';
import {
  // STYLISTIC
  GRID_PX,
  BORDER_RADIUS_PX,

  COLOR_BG_0,
  COLOR_BG_1,

  COLOR_BORDER_0,
  COLOR_BORDER_1,

  // BEHAVIORAL
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

import ButtonPrimitive from '@sqs/core-components/primitives/Button';
import ErrorText from '@sqs/core-components/primitives/ErrorText';
import {Modal} from '@sqs/experimental-components';

import AnimationStore from './AnimationStore';
import MediaStore from './MediaStore';

import Stage from './components/Stage';

import tmpStyle from './tmp.scss';

import {CSSLint} from 'csslint';

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

  captureRef = ref => {
    this.ref = ref;
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

const PropDefinitionList = ({ definitions, label, leftArrow, onClick, style }) => (
  <div style={{ backgroundColor: COLOR_BG_0, ...style }}>
    <ContextField label={label} fieldIndex={0} />
    <div>
      {definitions.map(def => (
        <Disclosure
          key={def.name}
          hoverable
          accessoryReducer={Accessory => (
            <div style={leftArrow ? { transform: 'scaleX(-1)' } : undefined}>
              <Accessory />
            </div>
          )}
          label={def.name}
          onClick={() => onClick(def.name)}
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
  ({ children, handles, onMouseDown }, ref) => handles.length && (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: `${handles[0].time * 100}%`,
        right: `${(1 - handles[handles.length-1].time) * 100}%`,
        height: '100%'
      }}
      onMouseDown={onMouseDown}
      >
      <div
        ref={ref}
        style={{ height: '100%' }}
        className={tmpStyle.tweenBar} // needed for hover
      />
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
    const { tween } = this.props;
    return (
      <AnimationStore.Consumer>
        {({ setHandleTime }) => (
          <TweenHandle
            index={index}
            onMouseDown={e => {
              if (!this.containerRef) return;

              const rect = this.containerRef.getBoundingClientRect();

              onDragStart(e, ({ pageX }) => {
                const time = clamp((pageX - rect.left) / rect.width, 0, 1);
                setHandleTime(tween.id, index, time);
              })
            }}
          />
        )}
      </AnimationStore.Consumer>
    );
  }

  render() {
    const {
      tween,
      style
    } = this.props;

    return (
      <TweenContainer style={style} ref={this.captureRef}>
        <AnimationStore.Consumer>
          {({ setTweenPosition }) => (
            <Drag.Consumer>
              {({ onDragStart }) => (
                <TweenBar
                  ref={this.captureBarRef}
                  handles={tween.handles}
                  onMouseDown={e => {
                    if (e.target !== this.barRef) return;
                    if (!this.containerRef || !this.barRef) return;

                    const rect = this.containerRef.getBoundingClientRect();
                    const barRect = this.barRef.getBoundingClientRect();

                    const initRatio = (barRect.left - rect.left) / rect.width;

                    onDragStart(e, ({ deltaX }) => {
                      const time = clamp(initRatio + deltaX / rect.width, 0, 1);
                      setTweenPosition(tween.id, time);
                    })
                  }}
                >
                  {this.renderHandle(0, onDragStart)}
                  {this.renderHandle(1, onDragStart)}
                </TweenBar>
              )}
            </Drag.Consumer>
          )}
        </AnimationStore.Consumer>
      </TweenContainer>
    );
  }
}

const Playhead = props => (
  <MediaStore.Consumer>
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
  </MediaStore.Consumer>
)

const PlayheadTime = props => (
  <MediaStore.Consumer>
    {({ playhead }) => (
      <div {...props}>{Number(playhead).toFixed(2)}</div>
    )}
  </MediaStore.Consumer>
)

const AnimTarget = ({ anim, tweens }) => (
  <AnimationStore.Consumer>
    {({ setAnimationOffset }) => (
      <Drag.Consumer>
        {({ onDragStart }) => (
          <MediaStore.Consumer>
            {({ playhead }) => (
              <div
                style={{
                  position: 'absolute',
                  top: anim.offset.y,
                  left: anim.offset.x
                }}
              >
                <div
                  onMouseDown={e => {
                    const init = anim.offset;
                    onDragStart(e, ({ deltaX, deltaY }) => {
                      setAnimationOffset(anim.id, {
                        x: init.x + deltaX,
                        y: init.y + deltaY
                      });
                    })
                  }}
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: 'blue',
                    ...tweens.reduce((style, tween) => {
                      const {
                        definition,
                        handles
                      } = tween;

                      // early exit if no handles
                      if (!handles.length) return style;

                      let value;
                      if (playhead <= handles[0].time) {
                        value = handles[0].value;
                      } else if (playhead >= last(handles).time) {
                        value = last(handles).value;
                      } else {
                        // interpolate
                        const [handle0, handle1] = handles.reduce((arr, handle) => {
                          if (handle.time <= playhead) {
                            arr[0] = handle;
                          }
                          if (arr[0] && !arr[1] && handle.time >= playhead) {
                            arr[1] = handle;
                          }
                          return arr;
                        }, []);

                        const { time: fromTime, value: fromValue } = handle0;
                        const { time: toTime, value: toValue } = handle1;
                        // interpolate
                        const scaledTime = (playhead - fromTime) / (toTime - fromTime);
                        const [_, curvedTime] = getPointAtTime(scaledTime, tween.easing);
                        value = definition.lerp(fromValue, toValue, curvedTime);
                      }
                      
                      style[definition.name] = value;
                      return style;
                    }, {})
                  }}
                />
              </div>
            )}
          </MediaStore.Consumer>
        )}
      </Drag.Consumer>
    )}
  </AnimationStore.Consumer>
)

// PLAY PAUSE CONTROLS
const MediaControls = ({ style }) => (
  <MediaStore.Consumer>
    {({ duration, isLooping, isReversed, isPlaying, playhead, setDuration, setLooping, setReversed, setPaused, setPlaying, setStopped }) => (
      <div
        style={{
          backgroundColor: COLOR_BG_0,
          border: `1px solid ${COLOR_BORDER_0}`,
          borderRadius: BORDER_RADIUS_PX,
          paddingTop: GRID_PX,
          ...style
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
  </MediaStore.Consumer>
)

const PlayheadCursor = () => (
  <MediaStore.Consumer>
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
  </MediaStore.Consumer>
)

class ImportCssModal extends React.Component {
  state = {
    replace: false,
    linted: this.lint(this.props.initValue),
    value:  this.props.initValue
  }

  handleChange = value => {
    this.setState({
      linted: this.lint(value),
      value
    })
  }

  lint(cssValue) {
    return CSSLint.verify(cssValue);
  }

  render() {
    const { onClose } = this.props;
    const { linted, replace, value } = this.state;

    const { messages } = linted;
    const errorMessages = linted.messages.filter(v => v.type === 'error');

    const confirmLabel = 'Import' + (replace ? ' (replace)' : '');

    return (
      <AnimationStore.Consumer>
        {({ importAnimations }) => (
          <Modal
            closeOnBackButton={true}
            onRequestClose={onClose}
          >
            <Modal.Backdrop />
            <Modal.Position position="center">
              <Modal.Dialog className={tmpStyle.importCssDialog}>
                <Modal.Dialog.Body>
                  <Modal.Dialog.Body.Title>
                    Import CSS
                  </Modal.Dialog.Body.Title>
                  <Modal.Dialog.Body.Message is="div">
                    <TextareaField
                      fieldIndex={0}
                      className={tmpStyle.monospace}
                      label="Paste Here"
                      onChange={this.handleChange}
                      value={value}
                    />
                    {errorMessages.map((msg, i) => {
                      return (
                        <ErrorText key={i} errors={{ message: msg.message }} />
                      )
                    })}
                  </Modal.Dialog.Body.Message>
                </Modal.Dialog.Body>

                <Modal.Dialog.Footer>
                  <Modal.Dialog.Footer.Button color="warning" onClick={onClose}>
                    Cancel
                  </Modal.Dialog.Footer.Button>
                  <BooleanField
                    label="Replace"
                    onChange={() => this.setState({ replace: !this.state.replace })}
                    value={replace}
                  />
                  <ButtonPrimitive
                    className={tmpStyle.flex1}
                    color="primary"
                    label={confirmLabel}
                    onClick={() => {
                      importAnimations(value); // MAGIC
                      onClose();
                    }}
                    isDisabled={errorMessages.length > 0}
                  ></ButtonPrimitive>
                </Modal.Dialog.Footer>
              </Modal.Dialog>

            </Modal.Position>
          </Modal>
        )}
      </AnimationStore.Consumer>
    );
  }
}

class App extends React.Component {
  state = {
    importCssValue: '',
    selectedAnimId: '',
    showImportModal: false
  }

  getCss = animations => {
    const css = this.state.animations.map(anim => {
      if (anim.tweens.length === 0) return '';
  
      const percentGroups = {};
  
      const pushTimestamp = (name, time, value) => {
        const percent = Math.floor(time * 100);
        (percentGroups[percent] = percentGroups[percent] || []).push({ name, value });
      }
  
      anim.tweens.forEach(tween => {
        tween.handles.forEach(h => pushTimestamp(tween.cssName, h.time, h.value));
      });
  
      const sorted = Object.entries(percentGroups)
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  
      const writeProp = ({ name, value }) => `${name}: ${value};`;
  
      const writePercentGroup = (percent, group) => `${percent}% { ${group.map(writeProp).join(' ') } }`;
  
      return `@keyframes anim_${anim.id} { ${sorted.map(([percent, group]) => writePercentGroup(percent, group)).join(' ') } }`;
    }).join(' ');
  
    return cssbeautify(css, {
      indent: '  ',
      autosemicolon: true
    });
  }

  render() {
    const { selectedAnimId } = this.state;

    return (
      <div
        style={{
          backgroundColor: COLOR_BG_1,
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
      
        {/* IMPORT DIALOGUE */}
        {this.state.showImportModal && (
          <ImportCssModal
            initValue=""
            onClose={() => this.setState({ showImportModal: false })}
          />
        )}
        
        {/* TOP REGION */}
        <div>
          <div style={{ display: 'flex', padding: GRID_PX }}>

            {/* LEFT OF STAGE */}
            <div style={{ width: 600, paddingRight: GRID_PX, display: 'flex', flexDirection: 'column' }}>

              {/* ADD + REMOVE ANIMATION */}
              <div style={{ display: 'flex' }}>
                <AnimationStore.Consumer>
                  {({ animations, addAnimation, removeAnimation }) => (
                    <>
                      <div style={{ flex: 1, paddingRight: GRID_PX }}>
                        <ButtonField
                          flush
                          inverted
                          size="small"
                          label="Add Animation"
                          onClick={() => {
                            const entry = addAnimation();
                            this.setState({
                              selectedAnimId: entry.id
                            })
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <ButtonField
                          flush
                          inverted
                          isDisabled={!selectedAnimId}
                          size="small"
                          label="Remove Animation"
                          onClick={() => {
                            const {anim, animIndex} = removeAnimation(selectedAnimId);

                            // if removing selected, apply new selected
                            if (anim.id === selectedAnimId) {
                              const nextAnim = animations[animIndex+1] || animations[animIndex-1];
                              this.setState({
                                selectedAnimId: nextAnim ? nextAnim.id : ''
                              });
                            }
                          }}
                        />
                      </div>
                    </>
                  )}
                </AnimationStore.Consumer>
              </div>

              {/* TWEEN LISTS */}
              <div style={{ display: 'flex', flex: 1, paddingTop: GRID_PX }}>
                <AnimationStore.Consumer>
                  {({ addTween, removeTween }) =>
                    selectedAnimId && (
                      <>
                        <PropDefinitionList
                          definitions={[]}
                          label="Available"
                          onClick={propName => addTween(selectedAnimId, propName)}
                          style={{ flex: 1, marginRight: GRID_PX }}
                        />
                        <PropDefinitionList
                          definitions={[]}
                          label="Added"
                          leftArrow={true}
                          onClick={propName => removeTween(selectedAnimId, propName)}
                          style={{ flex: 1 }}
                        />
                      </>
                    )
                  }
                </AnimationStore.Consumer>
              </div>

            </div>

            {/* STAGE AREA */}
            <div style={{ flex: 1 }}>
              <AnimationStore.Consumer>
                {({ animations, getTweens }) => (
                  <Stage>
                    {animations.map(anim => (
                      <AnimTarget
                        key={anim.id}
                        anim={anim}
                        tweens={getTweens(anim.id)}
                      />
                    ))}
                  </Stage>
                )}
              </AnimationStore.Consumer>
              
              <MediaControls style={{ marginTop: GRID_PX }} />

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
              borderTop: `1px solid ${COLOR_BORDER_1}`,
              borderRight: `1px solid ${COLOR_BORDER_1}`,
              borderRadius: `0 ${BORDER_RADIUS_PX}px 0 0`
            }}
          >

            {/* PLAYHEAD REGION */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 40,
                borderBottom: `1px solid ${COLOR_BORDER_0}`
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
                backgroundColor: COLOR_BG_0
              }}
            >
              <AnimationStore.Consumer>
                {({ animations, getTweens }) => (
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
                          borderBottom: `1px solid ${COLOR_BORDER_0}`
                        }}
                        onClick={
                          () => this.setState({ selectedAnimId: anim.id })
                        }
                      >
                        <ContextField label={anim.name} fieldIndex={0} />
                        <div style={{ paddingBottom: GRID_PX }} >
                          {getTweens(anim.id).map((tween, tweenIndex, tweens) => (
                            <div
                              key={tween.id}
                              style={{
                                display: 'flex'
                              }}
                            >
                              <TimelineLabel
                                label={tween.definition.name}
                                onClick={() => {}}
                              />
                              <TweenTimeline
                                tween={tween}
                                style={{ flex: 1 }}
                                underlined={tweenIndex !== tweens.length - 1}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </AnimationStore.Consumer>

            </div>

          </div>
          
          <div style={{ width: 300, display: 'flex', flexDirection: 'column' }}>
            {/* IMPORT CSS */}
            <ButtonField
              onClick={() => this.setState({ showImportModal: true })}
              label="Import CSS"
            />

            {/* GENERATED ANIMATION CSS */}
            {/* <Store.Consumer>
              {({ getCss }) => (
                <TextareaField
                  className={tmpStyle.exportTextarea}
                  fieldIndex={0}
                  label="Keyframe CSS"
                  value={getCss()}
                />
              )}
            </Store.Consumer> */}
          </div>
        </div>

      </div>
    );
  }
}

export default props => (
  <AnimationStore>
    <MediaStore>
      <Drag>
        <App {...props} />
      </Drag>
    </MediaStore>
  </AnimationStore>
);
