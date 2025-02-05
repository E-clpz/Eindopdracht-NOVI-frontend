import './Button.css';

function Button({ type, children, onClick, disabled = false, variant = 'primary' }) {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`button button-${variant}`}
        >
            {children}
        </button>
    );
}

export default Button;