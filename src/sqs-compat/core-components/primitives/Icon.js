import React from 'react';

export default ({ name }) => (
    <div style={{ display: 'inline-block' }}>
        {name === undefined ? '' : name[0].toUpperCase()}
    </div>
);
