import { React, cx } from 'common';
import { Box } from 'pu2';

import { useHover } from 'react-use';
import { ColorSquare, IconButton } from 'components/shared';

import styles from './ExpandingTitle.module.css';

const ExpandingTitle = ({ accessory, className, color, onEdit, isExpanded, label, onClick }) => {
	const [editLabel, setEditLabel] = React.useState(label);
	const [editing, setEditing] = React.useState(false);

	const hasEditIcon = !!onEdit && !editing;
	const isClickable = !!onClick;

	return useHover((isHovering) => (
		<div
			className={cx(
				styles.container,
				{
					[styles.hasAccessory]: accessory
				},
				className
			)}
		>
			{accessory && isHovering && <div className={styles.accessory}>{accessory}</div>}
			{color && (
				<Box pr="11px">
					<ColorSquare color={color} />
				</Box>
			)}
			{!editing && (
				<div
					className={cx({
						[styles.clickable]: isClickable
					})}
					role="button"
					onClick={onClick}
				>
					<div
						className={cx(styles.title, {
							[styles.expanded]: isExpanded
						})}
					>
						{label}
					</div>
				</div>
			)}
			{editing && (
				<input
					ref={(ref) => {
						if (ref) ref.focus();
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') e.target.blur(); // force blur
					}}
					onBlur={() => {
						setEditing(false);
						const trimmedLabel = editLabel.trim();
						if (trimmedLabel !== '' && trimmedLabel !== label) {
							onEdit(trimmedLabel);
						}
					}}
					onChange={(e) => setEditLabel(e.target.value)}
					type="text"
					value={editLabel}
				/>
			)}

			{hasEditIcon && (
				<IconButton
					className={cx(styles.btnEdit, {
						[styles.hidden]: !isHovering
					})}
					icon="Edit"
					onClick={() => {
						setEditLabel(label);
						setEditing(true);
					}}
				/>
			)}
		</div>
	))[0];
};

export default ExpandingTitle;
