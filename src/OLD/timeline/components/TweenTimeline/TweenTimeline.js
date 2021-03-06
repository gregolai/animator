import React from 'react';
import classnames from 'classnames';
import { AnimationStore, MediaStore, UIStore } from 'stores';
import { Drag, Ticks } from 'components/shared';

import styles from './TweenTimeline.scss';

const Keyframe = ({ keyframe, isDragging, onMouseDown }) => (
	<MediaStore.Consumer>
		{({ playhead, setPlayhead }) => (
			<div
				className={classnames(styles.keyframe, {
					[styles.dragging]: isDragging,
					[styles.atPlayhead]: playhead === keyframe.time
				})}
				style={{ left: `${keyframe.time * 100}%` }}
				onClick={() => setPlayhead(keyframe.time)}
				onMouseDown={onMouseDown}
			/>
		)}
	</MediaStore.Consumer>
);

const TweenBar = ({ keyframe0, keyframe1 }) => (
	<div
		className={styles.bar}
		style={{
			left: `${keyframe0.time * 100}%`,
			right: `${(1 - keyframe1.time) * 100}%`
		}}
	/>
);

const TweenTimeline = ({ tween, tweenIndex }) => {
	const timelineRef = React.useRef(null);

	return (
		<UIStore.Consumer>
			{({ isTweenHidden }) =>
				!isTweenHidden(tween.id) && (
					<div
						ref={timelineRef}
						className={classnames(styles.container, {
							[styles.odd]: tweenIndex & 1
						})}
					>
						<AnimationStore.Consumer>
							{({ getKeyframes, setKeyframeTime }) => {
								const keyframes = getKeyframes(tween.id);
								if (keyframes.length === 0) return null;

								const bars = [];
								for (let i = 0; i < keyframes.length - 1; ++i) {
									const kf0 = keyframes[i];
									const kf1 = keyframes[i + 1];
									bars.push(<TweenBar key={kf0.time} keyframe0={kf0} keyframe1={kf1} />);
								}

								return (
									<>
										{bars}
										{keyframes.map((keyframe) => (
											<Drag key={keyframe.id}>
												{({ isDragging, startDrag }) => (
													<Keyframe
														keyframe={keyframe}
														isDragging={isDragging}
														onMouseDown={(event) => {
															if (!timelineRef.current) return;
															if (event.button !== 0) return;

															const rect = timelineRef.current.getBoundingClientRect();
															startDrag({
																event,
																onUpdate: ({ pageX }) => {
																	const time =
																		(pageX - rect.left) / rect.width;
																	setKeyframeTime(keyframe.id, time);
																}
															});
														}}
													/>
												)}
											</Drag>
										))}
										<div className={styles.ticks}>
											<Ticks.EvenSpaced
												count={100}
												ticks={[
													{ mod: 10, height: 18, color: '#000' },
													{ mod: 5, height: 12, color: '#a1a1a1' },
													{ mod: 1, height: 4, color: '#c1c1c1' }
												]}
											/>
										</div>
									</>
								);
							}}
						</AnimationStore.Consumer>
					</div>
				)
			}
		</UIStore.Consumer>
	);
};

export default TweenTimeline;
