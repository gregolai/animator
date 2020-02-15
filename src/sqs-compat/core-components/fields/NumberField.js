import React from 'react';
import clamp from 'lodash/clamp';

export default ({
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    label,
    onChange,
    value
}) => {
    const c = v => (v === undefined ? undefined : clamp(v, min, max));

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
            {label}
            <input
                type="number"
                min={min}
                max={max}
                onChange={e => onChange(c(parseFloat(e.target.value)))}
                style={{ flex: 1 }}
                value={c(value)}
            />
        </label>
    );
};
