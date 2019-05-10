import React from 'react';
import classnames from 'classnames';
import { getStyleProp } from 'utils/cc/styleProps';

import styles from './ValueEditor.module.scss';

const ValueEditor = ({ className, definitionId, value, onChange }) => {

  const definition = getStyleProp(definitionId);

  return (
    <div className={classnames(styles.container, className)}>
      {definition.render({ value, onChange })}
    </div>
  );
};

export default ValueEditor;
