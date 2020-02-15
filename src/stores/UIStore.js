import { React, INTERVAL_MS } from 'common';
import { createPersist, normalizeRatio } from 'utils';

const persist = createPersist('UIStore', {
	expandedTweenId: -1,
	hiddenInstances: {},
	lockedTweens: {},
	selectedInstanceId: -1,
	tickSpacing: 4
});

const Context = React.createContext();
export default class UIStore extends React.Component {
	static use = () => React.useContext(Context);

	state = {
		expandedTweenId: persist.expandedTweenId.read(),
		hiddenInstances: persist.hiddenInstances.read(),
		lockedTweens: persist.lockedTweens.read(),
		selectedInstanceId: persist.selectedInstanceId.read(),

		animationCursor: {
			isActive: false,
			ratio: 0
		},

		tickSpacing: persist.tickSpacing.read()
	};

	componentDidMount() {
		//document.addEventListener('keydown', this.onKeyDown);
	}

	componentWillUnmount() {
		//document.removeEventListener('keydown', this.onKeyDown);
	}

	onKeyDown = e => {
		const excludeTags = ['INPUT', 'TEXTAREA', 'SELECT'];
		if (e.target && excludeTags.indexOf(e.target.tagName) !== -1) {
			return;
		}

		switch (e.code) {
			case 'Enter':
			case 'Space':
				e.preventDefault();
				this.state.isPlaying ? this.setPaused() : this.setPlaying();
				break;
			case 'Backspace':
				e.preventDefault();
				this.setStopped();
				break;
			case 'ArrowRight':
				e.preventDefault();
				this.setPlayhead(e.metaKey ? 1 : this.state.playhead + INTERVAL_MS);
				break;
			case 'ArrowLeft':
				e.preventDefault();
				this.setPlayhead(e.metaKey ? 0 : this.state.playhead - INTERVAL_MS);
				break;
			case 'End':
				e.preventDefault();
				// this.setPlayhead(this.state.duration);
				break;
			case 'Home':
				e.preventDefault();
				this.setPlayhead(0);
				break;
			case 'KeyR':
				if (!e.metaKey) {
					e.preventDefault();
					this.setReversed(!this.state.isReversed);
				}
				break;
			case 'KeyL':
				e.preventDefault();
				this.setLooping(!this.state.isLooping);
				break;
			case 'Backquote':
			case 'Digit1':
			case 'Digit2':
			case 'Digit3':
			case 'Digit4':
			case 'Digit5':
			case 'Digit6':
			case 'Digit7':
			case 'Digit8':
			case 'Digit9':
			case 'Digit0':
				e.preventDefault();

				// const time =
				//   e.code === 'Digit0'
				//     ? this.state.duration
				//     : e.code === 'Backquote'
				//       ? 0
				//       : (parseInt(e.code.replace('Digit', '')) / INTERVAL_MS) * this.state.duration;
				// this.setPlayhead(time);
				break;
			default:
		}
	};

	setSelectedInstance = instanceId => {
		const selectedInstanceId = instanceId;

		this.setState({ selectedInstanceId });
		persist.selectedInstanceId.write(selectedInstanceId);
	};

	isTweenExpanded = tweenId => {
		return this.state.expandedTweenId === tweenId;
	};

	setTweenExpanded = (tweenId, expand) => {
		const expandedTweenId = expand ? tweenId : -1;

		this.setState({ expandedTweenId });
		persist.expandedTweenId.write(expandedTweenId);
	};

	isTweenLocked = tweenId => {
		return !!this.state.lockedTweens[tweenId];
	};

	setTweenLocked = (tweenId, lock) => {
		const lockedTweens = { ...this.state.lockedTweens };

		if (lock) {
			lockedTweens[tweenId] = true;
		} else {
			delete lockedTweens[tweenId];
		}

		this.setState({ lockedTweens });
		persist.lockedTweens.write(lockedTweens);
	};

	isInstanceHidden = instanceId => {
		return !!this.state.hiddenInstances[instanceId];
	};

	setInstanceHidden = (instanceId, hide) => {
		const hiddenInstances = { ...this.state.hiddenInstances };

		if (hide) {
			hiddenInstances[instanceId] = true;
		} else {
			delete hiddenInstances[instanceId];
		}

		this.setState({ hiddenInstances });
		persist.hiddenInstances.write(hiddenInstances);
	};

	setTickSpacing = tickSpacing => {
		tickSpacing = Math.max(1, tickSpacing);

		this.setState({ tickSpacing });
		persist.tickSpacing.write(tickSpacing);
	};

	setAnimationCursor = (ratio, isActive) => {
		ratio = normalizeRatio(ratio);

		const animationCursor = {
			isActive,
			ratio
		};
		this.setState({ animationCursor });
	};

	render() {
		const { animationCursor, tickSpacing } = this.state;

		return (
			<Context.Provider
				value={{
					selectedInstanceId: this.state.selectedInstanceId,
					setSelectedInstance: this.setSelectedInstance,

					isTweenExpanded: this.isTweenExpanded,
					setTweenExpanded: this.setTweenExpanded,

					isInstanceHidden: this.isInstanceHidden,
					setInstanceHidden: this.setInstanceHidden,

					isTweenLocked: this.isTweenLocked,
					setTweenLocked: this.setTweenLocked,

					tickSpacing,
					setTickSpacing: this.setTickSpacing,

					animationCursor,
					setAnimationCursor: this.setAnimationCursor
				}}
			>
				{this.props.children}
			</Context.Provider>
		);
	}
}
