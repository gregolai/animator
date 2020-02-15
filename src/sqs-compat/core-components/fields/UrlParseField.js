import React from 'react';

export default ({ placeholder, onChange, value }) => {
    return (
        <label
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 44,
                borderBottom: '1px solid black'
            }}
        >
            <input
                placeholder={placeholder}
                type="text"
                style={{ flex: 1 }}
                onChange={e => onChange(e.target.value)}
                value={value}
            />
        </label>
    );
};
