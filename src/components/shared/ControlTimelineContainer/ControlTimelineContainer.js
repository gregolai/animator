import { React, cx } from 'common';

import styles from './ControlTimelineContainer.module.scss';


const ControlTimelineContainer = ({
  className,
  isSelected,
  controls,
  timeline
}) => {

  return (
    <div
      className={cx(styles.container, {
        [styles.selected]: isSelected
      }, className)}
    >
      <div className={styles.controls}>{controls}</div>
      <div className={styles.timeline}>{timeline}</div>
    </div>
  );
}

export default ControlTimelineContainer;