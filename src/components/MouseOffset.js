import { React } from 'common';

export default class MouseOffset extends React.Component {
	static defaultProps = {
		initialOffset: { x: 0, y: 0 }
	};

	state = {
		offset: this.props.initialOffset
	};

	componentDidMount() {
		document.addEventListener('mousemove', this.onMouseMove);
	}

	componentWillUnmount() {
		document.removeEventListener('mousemove', this.onMouseMove);
	}

	onMouseMove = e => {
		if (!this.ref) return;

		const rect = this.ref.getBoundingClientRect();
		const x = e.clientX - rect.x;
		const y = e.clientY - rect.y;

		this.setState({
			offset: { x, y }
		});
	};

	captureRef = ref => {
		this.ref = ref;
	};

	render() {
		const { offset } = this.state;

		return this.props.children({
			captureRef: this.captureRef,
			offset
		});
	}
}
