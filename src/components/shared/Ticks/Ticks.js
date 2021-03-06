import React from 'react';
import { Canvas } from 'components/shared';

const drawTick = (ctx, ticks, index, x) => {
	const { color, height, drawExtra } = getTick(ticks, index);

	const y = ctx.canvas.height - height;

	ctx.fillStyle = color || 'black';
	ctx.fillRect(x, y, 1, height);

	if (drawExtra) {
		drawExtra({ ctx, index, x, y });
	}
};

const getTick = (ticks, index) => {
	return ticks.find((tick) => tick.mod === 1 || index % tick.mod === 0);
};

class PixelSpaced extends React.Component {
	static defaultProps = {
		maxWidth: Number.MAX_SAFE_INTEGER,
		spacing: 4,
		ticks: [
			{ mod: 10, height: 12, color: '#a1a1a1' },
			{ mod: 5, height: 8, color: '#a1a1a1' },
			{ mod: 1, height: 4, color: '#a1a1a1' }
		]
	};

	renderTicks = (ctx) => {
		const { maxWidth, ticks, spacing } = this.props;
		for (let i = 1, x = spacing; x < ctx.canvas.width; ++i, x += spacing) {
			if (x >= maxWidth) {
				return;
			}

			drawTick(ctx, ticks, i, x);
		}
	};

	onFrame = (ctx) => {
		const { width, height } = ctx.canvas;
		ctx.clearRect(0, 0, width, height);
		this.renderTicks(ctx);
	};

	render() {
		const { delay, spacing, ticks, ...rest } = this.props;
		return <Canvas {...rest} onFrame={this.onFrame} />;
	}
}

class EvenSpaced extends React.Component {
	static defaultProps = {
		count: 100,
		ticks: [
			{ mod: 10, height: 12, color: '#a1a1a1' },
			{ mod: 5, height: 8, color: '#a1a1a1' },
			{ mod: 1, height: 4, color: '#a1a1a1' }
		]
	};

	renderTicks = (ctx) => {
		const { width } = ctx.canvas;
		const { count, ticks } = this.props;

		for (let i = 1; i < count; ++i) {
			const x = Math.floor((i / count) * width);
			drawTick(ctx, ticks, i, x);
		}
	};

	onFrame = (ctx) => {
		const { width, height } = ctx.canvas;
		ctx.clearRect(0, 0, width, height);
		this.renderTicks(ctx);
	};

	render() {
		const { count, ticks, ...rest } = this.props;
		return <Canvas {...rest} onFrame={this.onFrame} />;
	}
}

export default {
	PixelSpaced,
	EvenSpaced
};
