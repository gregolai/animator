import React from 'react';
import classnames from 'classnames';
import { useHover } from 'react-use';
import { Button, Hover } from 'components/shared';

import styles from './ValueButton.module.scss';

const ValueButton = ({
	accessory,
	buttonRef,
	canClear,
	className,
	definition,
	isDisabled,
	isToggled,
	onClick,
	onClear,
	value
}) => {
	return useHover((isHovering) => (
		<Button
			ref={buttonRef}
			className={classnames(
				styles.container,
				{
					[styles.disabled]: isDisabled
				},
				className
			)}
			isToggled={isToggled}
			onClick={onClick}
		>
			{accessory && isHovering && <div className={styles.accessory}>{accessory}</div>}
			<div className={styles.label}>{definition.friendlyLabel || definition.id}</div>
			<div className={styles.value}>{value === undefined ? '•' : definition.preview(value)}</div>
			{canClear && value !== undefined && (
				<div
					role="button"
					className={styles.clear}
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onClear();
					}}
				>
					clear
				</div>
			)}
		</Button>
	))[0];
};

export default ValueButton;
