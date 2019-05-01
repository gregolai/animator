import { React, cx } from 'utils';
import { CheckField } from 'components/core';
import { IconButton, Popover } from 'components/shared';

import styles from './AddDropdown.module.scss';

const AddDropdown = ({ anchor = 'down-left', className, icon = 'addBlock', label, label2, onSelect, options, value }) => {
  const [isOpen, onOpen] = React.useState(false);

  return (
    <div className={cx(styles.container, className)}>
      <div
        role="button"
        onClick={() => onOpen(!isOpen)}
        className={cx(styles.inner, {
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
        <Popover anchor={anchor} className={styles.dropdown}>
          {options.map(opt => (
            <CheckField
              key={opt.value}
              flush
              className={styles.item}
              icon={opt.icon}
              onClick={() => {
                onOpen(false);
                onSelect(opt.value)
              }}
              label={opt.label}
              value={opt.value === value}
            />
          ))}
        </Popover>
      )}
    </div>
  )
}
export default AddDropdown;
