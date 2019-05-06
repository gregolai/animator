import React from 'react';
import classnames from 'classnames';
import { getDefinition } from 'utils/definitions';

import styles from './ValueEditor.module.scss';

const ValueEditor = ({ className, definitionId, value, onChange }) => {

  const definition = getDefinition(definitionId);

  if (value === undefined) {
    value = definition.defaultValue;
  }

  return (
    <div className={classnames(styles.container, className)}>
      {definition.render({ value, onChange })}
    </div>
  );
};

export default ValueEditor;
