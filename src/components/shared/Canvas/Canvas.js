import { React, cx } from 'common';

import styles from './Canvas.module.scss';

export default class Canvas extends React.Component {
	static defaultProps = {
		loop: false
	};

	state = {
		height: 0,
		width: 0
	};

	_doFrame() {
		const curTime = Date.now();
		const deltaTime = curTime - this.prevTime;
		const elapsedTime = curTime - this.startTime;

		this.props.onFrame(this.cvs.getContext('2d'), deltaTime, elapsedTime);

		this.prevTime = curTime;
	}

	_startFrameLoop() {
		const loop = () => {
			this._doFrame();
			this.raf = requestAnimationFrame(loop);
		};
		this.raf = requestAnimationFrame(loop);
	}

	componentDidMount() {
		this.observer = new ResizeObserver((els) => {
			const { width, height } = els[0].contentRect;
			this.setState({ width, height });
		});
		this.observer.observe(this.cvs);

		this.startTime = Date.now();
		this.prevTime = this.startTime;

		if (this.props.loop) {
			this._startFrameLoop();
		}
	}

	componentWillUnmount() {
		cancelAnimationFrame(this.raf);
		if (this.observer) {
			this.observer.disconnect();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (!this.props.loop) {
			this._doFrame();
		}
	}

	captureRef = (ref) => {
		this.cvs = ref;
	};

	render() {
		const { className, onMouseDown } = this.props;
		const { width, height } = this.state;
		return (
			<canvas
				ref={this.captureRef}
				className={cx(styles.container, className)}
				height={height}
				width={width}
				onMouseDown={onMouseDown}
			/>
		);
	}
}
