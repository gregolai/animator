import React from 'react';
import classnames from 'classnames';
import { ContextField } from 'components/core';
import { Hover } from 'components/shared';

import styles from './ExpandingTitle.module.scss';

const ExpandingTitle =
  ({ accessory, className, isExpanded, label, onClick }) => (
    <Hover>
      {({ hoverRef, isHovering }) => (
        <div
          ref={hoverRef}
          className={classnames(styles.container, {
            [styles.clickable]: onClick,
            [styles.hasAccessory]: accessory
          }, className)}
        >
          {accessory && isHovering && <div className={styles.accessory}>{accessory}</div>}
          <ContextField
            className={classnames(styles.title, {
              [styles.expanded]: isExpanded
            })}
            label={label}
            fieldIndex={0}
            onClick={onClick}
          />
        </div>
      )}
    </Hover>
  );
export default ExpandingTitle;