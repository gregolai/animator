import React from 'react';
import clamp from 'lodash/clamp';

export default ({
    className,
    // flush = true

    label,
    min,
    max,
    onChange,
    step,
    underlined = true,
    value
}) => {
    const c = v => (v === undefined ? undefined : clamp(v, min, max));

    return (
        <label
            className={className}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 44,
                borderBottom: underlined
                    ? '1px solid black'
                    : '1px solid transparent'
            }}
        >
            {label}
            <input
                type="range"
                min={min}
                max={max}
                onChange={e => onChange(c(parseFloat(e.target.value)))}
                step={step}
                style={{ flex: 1 }}
                value={c(value)}
            />
        </label>
    );
};
