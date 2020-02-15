import React from 'react';
import clamp from 'lodash/clamp';

export default ({ detail, min = 0, max = 100, onChange, step, value }) => {
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
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                style={{ flex: 1 }}
                onChange={e => onChange(c(parseFloat(e.target.value)))}
                value={c(value)}
            />
            {detail}
        </label>
    );
};
