import React from 'react';
import classnames from 'classnames';
import Button from 'components/shared/Button';

import styles from './ValueButton.scss';

const ValueButton = React.forwardRef(
  ({ accessory, className, definition, isDisabled, isToggled, onClick, value }, ref) => (
    <Button
      ref={ref}
      className={classnames(styles.container, {
        [styles.disabled]: isDisabled
      }, className)}
      isToggled={isToggled}
      onClick={onClick}
    >
      {accessory && <div className={styles.accessory}>{accessory}</div>}
      <span className={styles.label}>
        {definition.id}
      </span>
      <span className={styles.value}>
        {value === undefined ? '•' : definition.format(value)}
      </span>
    </Button>
  ));

export default ValueButton;