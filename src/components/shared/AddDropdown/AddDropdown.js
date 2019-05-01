import { React, cx } from 'utils';
import { CheckField } from 'components/core';
import { IconButton } from 'components/shared';

import styles from './AddDropdown.module.scss';

const anchorStyleMap = {
  'down-left': styles.downLeft,
  'down-left-side': styles.downLeftSide,
  'up-left': styles.upLeft,
  'up-left-side': styles.upLeftSide,
  'down-right': styles.downRight,
  'down-right-side': styles.downRightSide,
  'up-right': styles.upRight,
  'up-right-side': styles.upRightSide
}

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
        <div className={cx(styles.dropdown, anchorStyleMap[anchor])}>
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
