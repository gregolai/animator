import { React, cx } from 'common';

import styles from './Popover.module.scss';

const anchorStyleMap = {
  'down-left': styles.downLeft,
  'down-left-side': styles.downLeftSide,
  'up-left': styles.upLeft,
  'up-left-side': styles.upLeftSide,
  'down-right': styles.downRight,
  'down-right-side': styles.downRightSide,
  'up-right': styles.upRight,
  'up-right-side': styles.upRightSide
};

const Popover = ({ anchor = 'down-left', children, className }) => (
  <div className={cx(styles.container, anchorStyleMap[anchor], className)}>{children}</div>
);
export default Popover;
