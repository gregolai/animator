import React from 'react';
import { createPersist } from 'utils/persist';

const persist = createPersist('StageStore', {
	gridSize: 22,
	showGrid: true,
	gridSnap: false,
	offset: { x: 0, y: 0 }
});

const Context = React.createContext();
export default class StageStore extends React.Component {
	static use = () => React.useContext(Context);

	state = {
		gridSize: persist.gridSize.read(),
		showGrid: persist.showGrid.read(),
		gridSnap: persist.gridSnap.read(),
		offset: persist.offset.read()
	};

	setGridSize = gridSize => {
		this.setState({ gridSize });
		persist.gridSize.write(gridSize);
	};

	setShowGrid = showGrid => {
		this.setState({ showGrid });
		persist.showGrid.write(showGrid);
	};

	setGridSnap = gridSnap => {
		this.setState({ gridSnap });
		persist.gridSnap.write(gridSnap);
	};

	setOffset = (x, y) => {
		const offset = { x, y };
		this.setState({ offset });
		persist.offset.write(offset);
	};

	render() {
		const { gridSize, showGrid, gridSnap, offset } = this.state;

		return (
			<Context.Provider
				value={{
					gridSize,
					setGridSize: this.setGridSize,

					showGrid,
					setShowGrid: this.setShowGrid,

					gridSnap,
					setGridSnap: this.setGridSnap,

					offset,
					setOffset: this.setOffset
				}}
			>
				{this.props.children}
			</Context.Provider>
		);
	}
}
