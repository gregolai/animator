import React from 'react';
import classnames from 'classnames';
import { ContextField } from 'components/core';

import styles from './ExpandingTitle.scss';

const ExpandingTitle = React.forwardRef(
  ({ accessory, className, isExpanded, label, onClick }, ref) => (
    <div
      ref={ref}
      className={classnames(styles.container, className)}
    >
      {accessory && <div className={styles.accessory}>{accessory}</div>}
      <ContextField
        className={classnames(styles.title, {
          [styles.expanded]: isExpanded
        })}
        label={label}
        fieldIndex={0}
        onClick={onClick}
      />
    </div>
  )
);
export default ExpandingTitle;