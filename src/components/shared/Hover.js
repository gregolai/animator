import React from 'react';

export default class Hover extends React.Component {
	state = { isHovering: false };

	onMouseEnter = (e) => this.setState({ isHovering: true });
	onMouseLeave = (e) => this.setState({ isHovering: false });

	addListeners(ref) {
		this.ref = ref;
		this.ref.addEventListener('mouseenter', this.onMouseEnter, false);
		this.ref.addEventListener('mouseleave', this.onMouseLeave, false);
	}

	removeListeners() {
		if (this.ref) {
			this.ref.removeEventListener('mouseenter', this.onMouseEnter, false);
			this.ref.removeEventListener('mouseleave', this.onMouseLeave, false);
			this.ref = undefined;
		}
	}

	hoverRef = (ref) => {
		if (ref) {
			this.removeListeners();
			this.addListeners(ref);
		}
	};

	componentWillUnmount() {
		this.removeListeners();
	}

	render() {
		return this.props.children({
			hoverRef: this.hoverRef,
			isHovering: this.state.isHovering
		});
	}
}
