import React from 'react';
import classnames from 'classnames';
import { ContextField } from 'components/core';
import { ColorSquare, Hover } from 'components/shared';

import styles from './ExpandingTitle.module.scss';

const ExpandingTitle = ({
  accessory,
  className,
  color,
  isExpanded,
  label,
  onLabelChange,
  onClick
}) => {
  const [editLabel, setEditLabel] = React.useState(label);
  const [editing, setEditing] = React.useState(false);

  return (
    <Hover>
      {({ hoverRef, isHovering }) => (
        <div
          ref={hoverRef}
          className={classnames(
            styles.container,
            {
              [styles.hasAccessory]: accessory
            },
            className
          )}
        >
          {accessory && isHovering && <div className={styles.accessory}>{accessory}</div>}
          {color && <ColorSquare className={styles.color} color={color} />}
          {!editing && (
            <div
              className={styles.clickable}
              role="button"
              onClick={() => {
                setEditLabel(label);
                setEditing(true);
              }}
            >
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
          {editing && (
            <input
              ref={ref => {
                if (ref) ref.focus();
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') e.target.blur(); // force blur
              }}
              onBlur={() => {
                setEditing(false);
                const trimmedLabel = editLabel.trim();
                if (trimmedLabel !== '' && trimmedLabel !== label) {
                  onLabelChange(trimmedLabel);
                }
              }}
              onChange={e => setEditLabel(e.target.value)}
              type="text"
              value={editLabel}
            />
          )}
        </div>
      )}
    </Hover>
  );
};

export default ExpandingTitle;
