import React from 'react';
import classnames from 'classnames';
import { Button, Hover } from 'components/shared';

import styles from './ValueButton.module.scss';

const ValueButton = ({ accessory, canClear, className, definition, isDisabled, isToggled, onClick, onClear, value }) => (
  <Hover>
    {({ hoverRef, isHovering }) => (
      <Button
        ref={hoverRef}
        className={classnames(styles.container, {
          [styles.hasAccessory]: accessory,
          [styles.disabled]: isDisabled
        }, className)}
        isToggled={isToggled}
        onClick={onClick}
      >
        {accessory && isHovering && (
          <div className={styles.accessory}>{accessory}</div>
        )}
        <span className={styles.label}>
          {definition.id}
        </span>
        <span className={styles.value}>
          {value === undefined ? '•' : definition.format(value, true)}
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
    )}
  </Hover>
);

export default ValueButton;