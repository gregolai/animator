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
import DisclosureField from '@sqs/core-components/fields/DisclosureField';

// STORES
import AnimationStore from './stores/AnimationStore';
import MediaStore from './stores/MediaStore';
import ImporterStore from './stores/ImporterStore';
import StageStore from './stores/StageStore';
import UIStore from './stores/UIStore';

import Stage from './components/stage/Stage';
import Drag from './components/shared/Drag';
import ImportCSSModal from './components/importer/ImportCSSModal';
import MediaControls from './components/media/MediaControls';
import Playhead from './components/playhead/Playhead';
import Timeline from './components/timeline/Timeline';

import tmpStyle from './tmp.scss';

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
                        border: isDragging ? '2px solid yellow' : undefined,
                        width: 30,
                        height: 30,
                        backgroundColor: 'blue',
                        ...tweens.reduce((style, tween) => {
                          const value = interpolate(tween.id, playhead);
                          if (value !== undefined) {
                            style[tween.definition.name] = value;
                          }
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
        <div style={{ display: 'flex', padding: GRID_PX, height: 500 }}>

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

            <div style={{ marginTop: GRID_PX }}>
              <MediaControls />
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
              borderRight: `1px solid ${COLOR_BORDER_1}`
            }}
          >

            {/* PLAYHEAD REGION */}
            <div style={{ borderBottom: `1px solid ${COLOR_BORDER_0}` }}>
              <Playhead />
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
