import { React, cx } from 'common';

import styles from './ColorSquare.module.scss';

const ColorSquare = ({ className, color }) => (
  <div
    className={cx(styles.container, className)}
    style={{ backgroundColor: color }}
  />
);

export default ColorSquare;
