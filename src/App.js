
import React from 'react';
import SplitPane from 'react-split-pane';
import cssbeautify from 'cssbeautify';

import { ButtonField, RangeField } from 'components/core';
import { withStores, AnimationStore, ImporterStore, UIStore } from 'stores';
import { DropdownCustom } from 'components/shared';
import { getEasingArray } from 'utils/easing';

import InstanceEditor from './components/instanceeditor/InstanceEditor';
import Stage from './components/stage/Stage';
import ImportCSSModal from './components/importer/ImportCSSModal';
import MediaControls from './components/media/MediaControls';
import Playhead from './components/playhead/Playhead';
import Timeline from './components/timeline/Timeline';

import Animations from './components/animations/Animations';
import Instances from './components/instances/Instances';

import styles from './App.module.scss';

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

const App = withStores(() => {
  const [debug, toggleDebug] = React.useState(true);

  return (
    <div className={styles.container}>
      {/* DEBUG */}
      <label
        style={{ userSelect: 'none', position: 'fixed', zIndex: 999, top: 0, left: 0 }}
      >
        Debug <input type="checkbox" onChange={() => toggleDebug(!debug)} checked={debug} />
      </label>

      {/* IMPORT DIALOGUE */}
      <ImportCSSModal />

      <SplitPane
        split="horizontal"
        minSize={300}
        maxSize={-300}
        defaultSize={window.innerHeight * 0.7}
      >
        {/* TOP REGION */}
        <SplitPane
          split="vertical"
          minSize={300}
          maxSize={1200}
          defaultSize={window.innerWidth * 0.5}
        >
          <div className={styles.topLeft}>
            <div className={styles.menu}>
              {/* IMPORT CSS */}
              <ImporterStore.Consumer>
                {({ setOpen }) => (
                  <div className={styles.menuItem}>
                    <ButtonField
                      size="small"
                      color="warning"
                      onClick={() => setOpen(true)}
                      label="Import CSS"
                    />
                  </div>
                )}
              </ImporterStore.Consumer>

              {/* ADD ANIMATION */}
              <AnimationStore.Consumer>
                {({ createAnimation }) => (
                  <div className={styles.menuItem}>
                    <ButtonField
                      size="small"
                      color="primary"
                      label="Create Animation"
                      onClick={() => createAnimation()}
                    />
                  </div>
                )}
              </AnimationStore.Consumer>
            </div>

            {/* KEYFRAME TIMELINES */}
            {!debug && <Timeline className={styles.timeline} />}
            {debug && <Animations className={styles.timeline} />}

          </div>

          {/* STAGE REGION */}
          <div className={styles.topRight}>
            <Stage className={styles.stage} showControls />
            <MediaControls className={styles.mediaControls} />
          </div>
        </SplitPane>

        {/* BOTTOM REGION */}
        <div className={styles.bottom}>
          {/* <Playhead className={styles.playhead} /> */}

          {/* INSTANCE EDITING */}
          {debug && <Instances />}
          {!debug && <InstanceEditor />}
        </div>

      </SplitPane>
    </div>
  );
});

export default App;

