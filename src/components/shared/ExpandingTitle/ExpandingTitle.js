import React from 'react';
import classnames from 'classnames';
import { ContextField, StringField } from 'components/core';
import { ColorSquare, Hover, IconButton } from 'components/shared';

import styles from './ExpandingTitle.module.scss';

const ExpandingTitle =
  ({ accessory, className, color, isExpanded, label, onLabelChange, onClick }) => {

    const [editing, setEditing] = React.useState(false);
    const [editLabel, onEditLabelChange] = React.useState(label);

    const canEdit = onLabelChange;

    return (
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
            {color && <ColorSquare className={styles.color} color={color} />}
            {!editing && (
              <>
                <ContextField
                  className={classnames(styles.title, {
                    [styles.expanded]: isExpanded
                  })}
                  label={label}
                  fieldIndex={0}
                  onClick={onClick}
                />
                {isHovering && canEdit && <IconButton icon="blog" onClick={() => setEditing(true)} />}
              </>
            )}
            {editing && (
              <StringField
                className={styles.editString}
                onKeyDown={e => {
                  if (e.key === 'Enter') e.target.blur(); // force blur
                }}
                onBlur={() => {
                  setEditing(false);
                  if (editLabel !== label) {
                    onLabelChange(editLabel);
                  }
                }}
                onChange={onEditLabelChange}
                value={editLabel}
              />
            )}
          </div>
        )}
      </Hover>
    );
  };
export default ExpandingTitle;
