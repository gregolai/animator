import React from 'react';

export default ({
    className,
    label,
    onChange,
    underlined = true,
    value = false
}) => {
    return (
        <div
            className={className}
            onClick={() => onChange(!value)}
            style={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 44,
                borderBottom: underlined ? '1px solid black' : undefined
            }}
        >
            <div style={{ flex: 1 }}>{label}</div>
            <div style={{ marginLeft: 11 }}>{value ? 'ON' : 'OFF'}</div>
        </div>
    );
};
