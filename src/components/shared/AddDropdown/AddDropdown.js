import React from 'react';
import { cx } from 'pu2';
import { CheckField } from 'components/core';
import { IconButton, Popover } from 'components/shared';

import styles from './AddDropdown.module.css';

const AddDropdown = ({ className, icon = 'Add', label, label2, onSelect, options, value }) => {
	const [containerEl, setContainerEl] = React.useState(null);
	const [isOpen, onOpen] = React.useState(false);

	return (
		<div ref={setContainerEl} className={cx(styles.container, className)}>
			<div
				role="button"
				onClick={() => onOpen(!isOpen)}
				className={cx(styles.inner, {
					[styles.open]: isOpen
				})}
			>
				{label && (
					<div className={styles.labels}>
						<div>{label}</div>
						{label2 && <div className={styles.label2}>{label2}</div>}
					</div>
				)}
				<IconButton icon={icon} />
			</div>
			{isOpen && (
				<Popover
					placement="bottom-start"
					referenceElement={containerEl} /*className={styles.dropdown}*/
				>
					{options.map((opt) => (
						<CheckField
							key={opt.value}
							flush
							className={styles.item}
							icon={opt.icon}
							onClick={() => {
								onOpen(false);
								onSelect(opt.value);
							}}
							label={opt.label}
							value={opt.value === value}
						/>
					))}
				</Popover>
			)}
		</div>
	);
};
export default AddDropdown;
