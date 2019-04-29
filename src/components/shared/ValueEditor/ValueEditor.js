import React from 'react';
import classnames from 'classnames';
import { getDefinition } from 'utils/definitions';

import styles from './ValueEditor.scss';

const ValueEditor = ({ className, definitionId, value, onChange }) => (
  <div className={classnames(styles.container, className)}>
    {getDefinition(definitionId).render({ value, onChange })}
  </div>
);

export default ValueEditor;