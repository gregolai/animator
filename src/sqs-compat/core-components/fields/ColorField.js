import React from 'react';
import { Box } from 'pu2';

const Swatch = ({ color, isSelected, onClick }) => (
	<Box
		border={`1px solid ${isSelected ? 'black' : 'transparent'}`}
		display="inline-block"
		height="22px"
		onClick={onClick}
		style={{ backgroundColor: color }}
		width="22px"
	/>
);

export default ({ onChange, showTransparentColor, value }) => {
	return (
		<Box width="400px">
			{value.palette.map((color) => {
				return (
					<Swatch
						key={color}
						color={color}
						isSelected={color === value.color}
						onClick={() => onChange({ color })}
					/>
				);
			})}
			{showTransparentColor && (
				<Swatch
					key="transparent"
					color={'purple'}
					isSelected={color === 'transparent'}
					onClick={() => onChange({ color: 'transparent' })}
				/>
			)}
		</Box>
	);
};
