import React from 'react';
import classnames from 'classnames';

import { CheckField } from 'components/core';
import { IconButton } from 'components/shared';

import styles from './AddDropdown.scss';

const AddDropdown = ({ className, icon = 'addBlock', label, label2, onSelect, options, value }) => {
  const [isOpen, onOpen] = React.useState(false);

  return (
    <div className={classnames(styles.container, className)}>
      <div
        role="button"
        onClick={() => onOpen(!isOpen)}
        className={classnames(styles.inner, {
          [styles.open]: isOpen
        })}
      >
        {label && (
          <div className={styles.labels}>
            <div>{label}</div>
            {label2 && <div className={styles.label2}>{label2}</div>}
          </div>
        )}
        <IconButton icon={icon} />
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          {options.map(opt => (
            <CheckField
              key={opt.value}
              flush
              className={styles.item}
              onClick={() => {
                onOpen(false);
                onSelect(opt.value)
              }}
              label={opt.label}
              value={opt.value === value}
            />
          ))}
        </div>
      )}
    </div>
  )
}
export default AddDropdown;
