
import React from 'react';
import SplitPane from 'react-split-pane';
import cssbeautify from 'cssbeautify';

import { ButtonField } from 'components/core';
import { withStores, AnimationStore, ImporterStore, UIStore } from 'stores';

import Stage from './components/stage/Stage';
import ImportCSSModal from './components/importer/ImportCSSModal';
import MediaControls from './components/media/MediaControls';
import Playhead from './components/playhead/Playhead';
import PropDefinitionList from './components/cssprops/PropDefinitionList';
import Timeline from './components/timeline/Timeline';

import styles from './App.scss';

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

const App = withStores(() => (
  <div className={styles.container}>
    {/* IMPORT DIALOGUE */}
    <ImportCSSModal />

    <SplitPane
      split="horizontal"
      minSize={300}
      maxSize={-200}
      defaultSize={500}
    >
      {/* TOP REGION */}
      <div className={styles.top}>

        {/* LEFT OF STAGE */}
        <div className={styles.topLeft}>
          {/* IMPORT CSS */}
          <ImporterStore.Consumer>
            {({ setOpen }) => (
              <ButtonField
                flush
                className={styles.importButton}
                onClick={() => setOpen(true)}
                label="Import CSS"
              />
            )}
          </ImporterStore.Consumer>

          {/* GENERATED ANIMATION CSS */}
          {/* <Store.Consumer>
        {({ getCss }) => (
          <TextareaField
            fieldIndex={0}
            label="Keyframe CSS"
            value={getCss()}
          />
        )}
      </Store.Consumer> */}

          {/* DEFINITION LISTS */}
          <PropDefinitionList className={styles.propList} />

          {/* ADD ANIMATION */}
          <UIStore.Consumer>
            {({ setSelectedAnim }) => (
              <AnimationStore.Consumer>
                {({ createAnimation }) => (
                  <ButtonField
                    flush
                    inverted
                    size="small"
                    label="Add Animation"
                    onClick={() => {
                      const { anim } = createAnimation();
                      setSelectedAnim(anim.id);
                    }}
                  />
                )}
              </AnimationStore.Consumer>
            )}
          </UIStore.Consumer>
        </div>

        {/* STAGE REGION */}
        <div className={styles.topRight}>
          <Stage className={styles.stage} showControls />
          <MediaControls className={styles.mediaControls} />
        </div>

      </div>

      {/* BOTTOM REGION */}
      <div className={styles.bottom}>
        <Playhead className={styles.playhead} />
        <Timeline className={styles.timeline} />
      </div>

    </SplitPane>
  </div>
));

export default App;

