import React from 'react';
import classnames from 'classnames';

import { Icon } from 'components/core';
import { Button } from 'components/shared';

import styles from './IconButton.module.scss';

const IconButton = ({ className, icon, ...rest }) => (
  <Button
    className={classnames(styles.container, className)}
    {...rest}
  >
    <Icon name={icon} />
  </Button>
)

export default IconButton;