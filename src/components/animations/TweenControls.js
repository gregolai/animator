import { React, cx, isNumber } from 'common';

import CursorTime from './CursorTime';
import { AnimationStore, UIStore } from 'stores';
import { IconButton, Popover, ValueButton, ValueEditor } from 'components/shared';
import { getStyleProp } from 'utils/cc/styleProps';
import { InterpolateProp } from 'utils/AnimationController';

import styles from './TweenControls.module.scss';

const TweenControls = ({ className, tween }) => {
	const { easing, cursorTime } = CursorTime.use();
	const {
		deleteTween,
		getKeyframes,
		getKeyframeAtTime,
		createKeyframe,
		deleteKeyframe,
		setKeyframeValueAtTime
	} = AnimationStore.use();
	const { isTweenLocked, setTweenLocked, isTweenExpanded, setTweenExpanded } = UIStore.use();

	return (
		<InterpolateProp
			definitionId={tween.definitionId}
			easing={easing}
			keyframes={getKeyframes(tween.id)}
			time={cursorTime}
		>
			{value => {
				const keyframeAtTime = getKeyframeAtTime(tween.id, cursorTime);

				const definition = getStyleProp(tween.definitionId);

				const isLocked = isTweenLocked(tween.id);
				const isExpanded = isTweenExpanded(tween.id);

				const hideKeyframeAdd = !isNumber(cursorTime);
				const hideKeyframeDelete = !isNumber(cursorTime);

				const canDelete = !isLocked;
				const canExpand = !isLocked;

				return (
					<div className={cx(styles.container, className)}>
						{/* PREVIEW */}
						<ValueButton
							accessory={
								canDelete && (
									<IconButton
										icon="Delete"
										onClick={() => deleteTween(tween.id)}
									/>
								)
							}
							className={styles.btnValue}
							definition={definition}
							isToggled={isExpanded}
							onClick={
								canExpand
									? () => setTweenExpanded(tween.id, !isExpanded)
									: undefined
							}
							value={value}
						/>

						{/* LOCK BUTTON */}
						<IconButton
							icon={isLocked ? 'Locked' : 'Unlock'}
							isToggled={isLocked}
							onClick={() => {
								// toggle lock
								const lock = !isLocked;
								setTweenLocked(tween.id, lock);
								if (lock) setTweenExpanded(tween.id, false);
							}}
						/>

						{/* ADD/CLEAR KEYFRAME BUTTON */}
						<IconButton
							className={cx(styles.btnAddKeyframe, {
								[styles.hidden]: keyframeAtTime
									? hideKeyframeDelete
									: hideKeyframeAdd
							})}
							icon={keyframeAtTime ? 'SubtractOutline' : 'Add'}
							onClick={() => {
								if (keyframeAtTime) {
									deleteKeyframe(keyframeAtTime.id);
								} else {
									createKeyframe(tween.id, cursorTime, value);
								}
							}}
						/>

						{/* VALUE EDITOR */}
						{isExpanded && (
							<Popover anchor="down-left" className={styles.editor}>
								<ValueEditor
									definitionId={tween.definitionId}
									value={value}
									onChange={value =>
										setKeyframeValueAtTime(tween.id, cursorTime || 0, value)
									}
								/>
							</Popover>
						)}
					</div>
				);
			}}
		</InterpolateProp>
	);
};
export default TweenControls;
