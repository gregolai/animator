import React from 'react';
import classnames from 'classnames';

import styles from './Button.module.scss';

const Button = React.forwardRef(
  ({ children, className, onClick, isToggled }, ref) => (
    <div
      ref={ref}
      role="button"
      className={classnames(
        styles.container,
        {
          [styles.toggled]: isToggled
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
);
export default Button;
