import React from 'react';

export default ({
    // isFloating = true
    options,
    placeholder,
    onChange,
    value
}) => {
    const [isOpen, setOpen] = React.useState(false);

    const currentOption = options.find(opt => opt.value === value);

    return (
        <div
            style={{
                position: 'relative'
            }}
        >
            <div
                onClick={() => setOpen(!isOpen)}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 44,
                    borderBottom: '1px solid black',
                    cursor: 'pointer',
                    opacity: currentOption ? 1 : 0.4
                }}
            >
                {currentOption ? currentOption.label : placeholder}
            </div>
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        width: '100%',
                        border: '1px solid black'
                    }}
                >
                    {options.map(opt => (
                        <div
                            onClick={() => {
                                setOpen(false);
                                onChange(opt.value);
                            }}
                            style={{
                                cursor: 'pointer',
                                height: 22,
                                backgroundColor:
                                    opt.value === value ? 'lightblue' : 'white'
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
