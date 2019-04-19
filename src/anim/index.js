import React from 'react';
import cssbeautify from 'cssbeautify';
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
import DisclosureField from '@sqs/core-components/fields/DisclosureField';
import NumberField from '@sqs/core-components/fields/NumberField';

// STORES
import AnimationStore from './stores/AnimationStore';
import MediaStore from './stores/MediaStore';
import ImporterStore from './stores/ImporterStore';
import StageStore from './stores/StageStore';
import UIStore from './stores/UIStore';

import Stage from './components/stage/Stage';
import Drag from './components/shared/Drag';
import ImportCSSModal from './components/importer/ImportCSSModal';
import Timeline from './components/timeline/Timeline';

import tmpStyle from './tmp.scss';

const TIMELINE_LABEL_PX = 260;

const PropDefinitionList = ({ definitions, onClick }) => (
  <div style={{ backgroundColor: COLOR_BG_0, overflowY: 'scroll' }}>
    {definitions.map(def => (
      <DisclosureField
        key={def.name}
        hoverable
        label={def.name}
        onClick={() => onClick(def.name)}
      />
    ))}
  </div>
);

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
  <UIStore.Consumer>
    {({ setSelectedAnim }) => (
      <AnimationStore.Consumer>
        {({ interpolate, setAnimationOffset }) => (
          <Drag>
            {({ isDragging, onDragStart }) => (
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
                      className={tmpStyle.animTarget}
                      onMouseDown={e => {
                        if (e.button !== 0) return;

                        setSelectedAnim(anim.id);

                        const init = anim.offset;
                        onDragStart(e, ({ deltaX, deltaY }) => {
                          setAnimationOffset(anim.id, {
                            x: init.x + deltaX,
                            y: init.y + deltaY
                          });
                        })
                      }}
                      style={{
                        border: isDragging ? '10px solid yellow' : undefined,
                        width: 30,
                        height: 30,
                        backgroundColor: 'blue',
                        ...tweens.reduce((style, tween) => {
                          const value = interpolate(tween.id, playhead);
                          style[tween.definition.name] = value;
                          return style;
                        }, {})
                      }}
                    />
                  </div>
                )}
              </MediaStore.Consumer>
            )}
          </Drag>
        )}
      </AnimationStore.Consumer>
    )}
  </UIStore.Consumer>
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



        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, marginRight: GRID_PX }}>
            <NumberField
              label="Duration"
              min={MIN_DURATION_MS}
              max={MAX_DURATION_MS}
              onChange={setDuration}
              value={duration}
            />
          </div>

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

class App extends React.Component {

  // getCss = animations => {
  //   const css = this.state.animations.map(anim => {
  //     if (anim.tweens.length === 0) return '';

  //     const percentGroups = {};

  //     const pushTimestamp = (name, time, value) => {
  //       const percent = Math.floor(time * 100);
  //       (percentGroups[percent] = percentGroups[percent] || []).push({ name, value });
  //     }

  //     anim.tweens.forEach(tween => {
  //       tween.keyframes.forEach(h => pushTimestamp(tween.cssName, h.time, h.value));
  //     });

  //     const sorted = Object.entries(percentGroups)
  //       .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

  //     const writeProp = ({ name, value }) => `${name}: ${value};`;

  //     const writePercentGroup = (percent, group) => `${percent}% { ${group.map(writeProp).join(' ') } }`;

  //     return `@keyframes anim_${anim.id} { ${sorted.map(([percent, group]) => writePercentGroup(percent, group)).join(' ') } }`;
  //   }).join(' ');

  //   return cssbeautify(css, {
  //     indent: '  ',
  //     autosemicolon: true
  //   });
  // }

  render() {
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
        <ImportCSSModal />

        {/* TOP REGION */}
        <div style={{ display: 'flex', padding: GRID_PX, height: 600 }}>

          {/* LEFT OF STAGE */}
          <div style={{
            width: 300,
            paddingRight: GRID_PX,
            display: 'flex',
            flexDirection: 'column'
          }}>


            {/* IMPORT CSS */}
            <ImporterStore.Consumer>
              {({ setOpen }) => (
                <ButtonField
                  flush
                  onClick={() => setOpen(true)}
                  label="Import CSS"
                />
              )}
            </ImporterStore.Consumer>

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




            {/* DEFINITION LISTS */}
            <div
              style={{
                display: 'flex',
                flex: 1,
                paddingBottom: GRID_PX,
                overflow: 'hidden'
              }}
            >
              <UIStore.Consumer>
                {({ selectedAnimId }) => (
                  <AnimationStore.Consumer>
                    {({ addTween, getUnusedPropDefinitions }) =>
                      selectedAnimId !== -1 && (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <ContextField label="Available" fieldIndex={0} />
                          <PropDefinitionList
                            definitions={getUnusedPropDefinitions(selectedAnimId)}
                            onClick={propName => addTween(selectedAnimId, propName)}
                          />
                        </div>
                      )
                    }
                  </AnimationStore.Consumer>
                )}
              </UIStore.Consumer>
            </div>

            {/* ADD ANIMATION */}
            <UIStore.Consumer>
              {({ setSelectedAnim }) => (
                <AnimationStore.Consumer>
                  {({ addAnimation }) => (
                    <ButtonField
                      flush
                      inverted
                      size="small"
                      label="Add Animation"
                      onClick={() => {
                        const { anim } = addAnimation();
                        setSelectedAnim(anim.id);
                      }}
                    />
                  )}
                </AnimationStore.Consumer>
              )}
            </UIStore.Consumer>
          </div>

          {/* STAGE AREA */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <AnimationStore.Consumer>
              {({ getAnimations, getTweens }) => (
                <Stage className={tmpStyle.flex1} showControls>
                  {getAnimations().map(anim => (
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

        {/* BOTTOM REGION */}
        <div style={{ flex: 1, display: 'flex' }}>

          {/* LEFT BOTTOM REGION */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderTop: `1px solid ${COLOR_BORDER_1}`,
              borderRight: `1px solid ${COLOR_BORDER_1}`
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
            <Timeline className={tmpStyle.flex1} />
          </div>
        </div>

      </div>
    );
  }
}

export default props => (
  <ImporterStore>
    <AnimationStore>
      <MediaStore>
        <UIStore>
          <StageStore>
            <App {...props} />
          </StageStore>
        </UIStore>
      </MediaStore>
    </AnimationStore>
  </ImporterStore>
);
