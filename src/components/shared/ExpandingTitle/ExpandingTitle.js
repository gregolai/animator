import React from 'react';
import classnames from 'classnames';
import { ContextField } from 'components/core';
import { ColorSquare, Hover, IconButton } from 'components/shared';

import styles from './ExpandingTitle.module.scss';

const ExpandingTitle = ({
  accessory,
  className,
  color,
  onEdit,
  isExpanded,
  label,
  onClick
}) => {
  const [editLabel, setEditLabel] = React.useState(label);
  const [editing, setEditing] = React.useState(false);

  const hasEditIcon = !!onEdit && !editing;

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
              onClick={onClick}
            >
              <ContextField
                className={classnames(styles.title, {
                  [styles.expanded]: isExpanded
                })}
                label={label}
                fieldIndex={0}

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
                  onEdit(trimmedLabel);
                }
              }}
              onChange={e => setEditLabel(e.target.value)}
              type="text"
              value={editLabel}
            />
          )}

          {isHovering && hasEditIcon && (
            <IconButton
              className={styles.btnEdit}
              icon="visitLink"
              onClick={() => {
                setEditLabel(label);
                setEditing(true);
              }} />
          )}
        </div>
      )}
    </Hover>
  );
};

export default ExpandingTitle;
