import React from 'react';

const Swatch = ({ color, isSelected, onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'inline-block',
                height: 22,
                width: 22,
                backgroundColor: color,
                border: isSelected ? '1px solid black' : '1px solid transparent'
            }}
        />
    );
};

export default ({ onChange, showTransparentColor, value }) => {
    return (
        <div style={{ width: 400 }}>
            {value.palette.map(color => {
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
        </div>
    );
};
