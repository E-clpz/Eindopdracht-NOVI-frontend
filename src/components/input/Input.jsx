import "./Input.css";

const Input = ({ label, name, type, required }) => {
    return (
        <label className="input-label">
            {label} {required && "*"}
            <input
                name={name}
                type={type}
                required={required}
                className="input-field"
            />
        </label>
    );
};

export default Input;