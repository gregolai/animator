import React from 'react';
import ButtonField from '../core-components/fields/ButtonField';

export const Modal = ({
    children,
    /*closeOnBackButton = true */ onRequestClose = () => {}
}) => {
    return (
        <div
            style={{
                position: 'fixed',
                zIndex: 9,
                height: '90vh',
                width: '90vw',
                transform: 'translate(-50%,-50%)'
            }}
        >
            <button onClick={onRequestClose}>Back</button>
            {children}
        </div>
    );
};

Modal.Backdrop = () => {
    return (
        <div
            style={{
                position: 'absolute',
                zIndex: 1,
                left: 0,
                top: 0,
                height: '100vh',
                width: '100vw'
            }}
        />
    );
};

Modal.Position = ({ children /*position = 'center'*/ }) => {
    return (
        <div
            style={{
                position: 'absolute',
                zIndex: 2,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)'
            }}
        >
            {children}
        </div>
    );
};

Modal.Dialog = ({ children, className }) => {
    return (
        <div
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '90vh',
                width: '90vw'
            }}
        >
            {children}
        </div>
    );
};
Modal.Dialog.Body = ({ children }) => {
    return <div style={{ flex: 1 }}>{children}</div>;
};
Modal.Dialog.Body.Title = ({ children }) => {
    return <h1>{children}</h1>;
};
Modal.Dialog.Body.Message = ({ children, is: Component = 'div' }) => {
    return <Component>{children}</Component>;
};
Modal.Dialog.Footer = ({ children }) => {
    return <div>{children}</div>;
};
Modal.Dialog.Footer.Button = ({ children, color, onClick }) => {
    return <ButtonField color={color} label={children} onClick={onClick} />;
};
