import { React, cx } from 'common';
import { TextareaField } from 'components/core';
import { IconButton, ImportExportModal } from 'components/shared';
import { AnimationStore } from 'stores';

import imgCSS from 'css3.svg';
import imgSquarespace from 'squarespace.svg';
import imgJSF from 'jsf.png';

import styles from './Export.module.scss';

const Export = ({ onRequestClose }) => {

  const [choice, setChoice] = React.useState('');

  return (
    <>
      {/* CHOICE */}
      <ImportExportModal
        cancelButtonLabel="Close"
        isOpen={choice === ''}
        onRequestClose={onRequestClose}
        title="Export"
      >
        <div className={styles.choices}>
          <div className={styles.choice}>
            <img className={styles.img} src={imgCSS} />
          </div>
          <div className={styles.choice} onClick={() => setChoice('jsf')}>
            <img className={styles.img} src={imgSquarespace} />
            <img className={cx(styles.img, styles.jsf)} src={imgJSF} />
          </div>
        </div>
      </ImportExportModal>

      {/* CHOICE: CSS */}
      <ImportExportModal
        cancelButtonLabel="Back"
        isOpen={choice === 'css'}
        onRequestClose={() => setChoice('')}
        title="Export CSS"
      >
        <AnimationStore.Consumer>
          {({ getExportCSS }) => (
            <TextareaField
              fieldIndex={0}
              className={styles.textarea}
              label="CSS Keyframes"
              onChange={() => { }}
              value={getExportCSS()}
            />
          )}
        </AnimationStore.Consumer>
      </ImportExportModal>

      {/* CHOICE: JSF */}
      <ImportExportModal
        cancelButtonLabel="Back"
        isOpen={choice === 'jsf'}
        onRequestClose={() => setChoice('')}
        title="Export JSF"
      >
        <AnimationStore.Consumer>
          {({ getExportJSF }) => (
            <TextareaField
              fieldIndex={0}
              className={styles.textarea}
              label="UISCHEMA"
              onChange={() => { }}
              value={getExportJSF()}
            />
          )}
        </AnimationStore.Consumer>
      </ImportExportModal>
    </>
  )
}

export default Export;