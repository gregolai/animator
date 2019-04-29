import React from 'react';
import classnames from 'classnames';
import { Button } from 'components/shared';

import styles from './ValueButton.scss';

const ValueButton = React.forwardRef(
  ({ accessory, canClear, className, definition, isDisabled, isToggled, onClick, onClear, value }, ref) => (
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
      {canClear && value !== undefined && (
        <div
          role="button"
          className={styles.clear}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            onClear();
          }}
        >
          clear
        </div>
      )}
    </Button>
  ));

export default ValueButton;