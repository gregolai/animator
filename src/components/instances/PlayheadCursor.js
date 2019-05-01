import { React, cx } from 'utils';

import { MediaStore } from 'stores';
// import { Canvas } from 'components/shared';

import styles from './PlayheadCursor.module.scss';


const PlayheadCursor = () => {
  return (
    <MediaStore.Consumer>
      {({ playhead }) => (
        <div style={{ position: 'absolute', top: 0, left: playhead, width: 1, height: '100%', zIndex: 1, backgroundColor: 'black' }} />
      )}
    </MediaStore.Consumer>
  )
}

export default PlayheadCursor;