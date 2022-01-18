import React from 'react';
import clamp from 'lodash/clamp';
import { createPersist } from 'pu2';

const persist = createPersist('PlaybackController', {
	isLooping: true,
	isReversed: false,
	playhead: 0
});

const Context = React.createContext(null);

interface Props {
	duration: number;
}

interface State {
	isPlaying: boolean;
	isLooping: boolean;
	isReversed: boolean;
	playhead: number;
}

export default class PlaybackController extends React.Component<Props, State> {
	static use = () => React.useContext(Context);

	static defaultProps = {
		duration: 1000
	};

	static getDerivedStateFromProps(nextProps: Props, prevState: State) {
		// keep playhead within duration
		const playhead = clamp(prevState.playhead, 0, nextProps.duration);

		if (prevState.playhead !== playhead) {
			return {
				playhead
			};
		}
		return null;
	}

	state = {
		isPlaying: false,
		isLooping: persist.isLooping.read(),
		isReversed: persist.isReversed.read(),
		playhead: persist.playhead.read()
	};

	playLoop: number = null;

	setPlaying = () => {
		if (this.state.isPlaying) {
			return;
		}

		this.setState({
			isPlaying: true
		});

		let prevTime = Date.now();
		const onFrame = () => {
			const curTime = Date.now();
			const deltaTime = curTime - prevTime;

			let isPlaying = true;
			let playhead = this.state.playhead + (this.state.isReversed ? -deltaTime : deltaTime);

			// reversed
			if (playhead < 0) {
				if (this.state.isLooping) {
					playhead = clamp(this.props.duration + playhead, 0, this.props.duration);
				} else {
					isPlaying = false;
					playhead = 0;
				}
			}

			if (playhead > this.props.duration) {
				if (this.state.isLooping) {
					playhead = clamp(this.props.duration - playhead, 0, this.props.duration);
				} else {
					isPlaying = false;
					playhead = this.props.duration;
				}
			}

			this.setState({ playhead, isPlaying });
			persist.playhead.write(playhead);

			if (isPlaying) {
				prevTime = curTime;
				this.playLoop = requestAnimationFrame(onFrame);
			}
		};
		this.playLoop = requestAnimationFrame(onFrame);
	};

	setPaused = () => {
		cancelAnimationFrame(this.playLoop);
		this.setState({
			isPlaying: false
		});
	};

	setStopped = () => {
		cancelAnimationFrame(this.playLoop);
		this.setState({
			isPlaying: false,
			playhead: 0
		});
		persist.playhead.write(0);
	};

	setPlayhead = (playhead: number) => {
		playhead = clamp(playhead, 0, this.props.duration);
		this.setState({
			playhead
		});
		persist.playhead.write(playhead);
	};

	setLooping = (isLooping: boolean) => {
		this.setState({ isLooping });
		persist.isLooping.write(isLooping);
	};

	setReversed = (isReversed: boolean) => {
		this.setState({ isReversed });
		persist.isReversed.write(isReversed);
	};

	render() {
		const { isPlaying, isLooping, isReversed, playhead } = this.state;
		return (
			<Context.Provider
				value={{
					// ease of access for consumers
					duration: this.props.duration,

					isPlaying,
					setPlaying: this.setPlaying,
					setPaused: this.setPaused,
					setStopped: this.setStopped,

					isLooping,
					setLooping: this.setLooping,

					isReversed,
					setReversed: this.setReversed,

					playhead,
					setPlayhead: this.setPlayhead
				}}
			>
				{this.props.children}
			</Context.Provider>
		);
	}
}
