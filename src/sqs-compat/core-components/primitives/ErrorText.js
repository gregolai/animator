import React from 'react';
export default ({ errors }) => {
    return <div style={{ color: 'red' }}>{errors.message}</div>;
};
