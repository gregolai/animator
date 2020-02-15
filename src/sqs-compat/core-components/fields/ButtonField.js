import React from 'react';

export default ({
    color = 'primary' /* or "warning" */,
    inverted = false,
    isDisabled = false,
    label,
    onClick,
    size
}) => {
    color =
        color === 'primary' ? 'blue' : color === 'warning' ? 'red' : 'black';
    return (
        <div
            onClick={onClick}
            style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: size === 'small' ? 22 : 44,
                opacity: isDisabled ? 0.4 : 1,
                backgroundColor: inverted ? 'black' : 'white',
                color: inverted ? 'white' : color
            }}
        >
            {label}
        </div>
    );
};
