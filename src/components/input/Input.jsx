import "./Input.css";

const Input = ({ onChange, label, name, type, required }) => {
    return (
        <label className="input-label">
            {label} {required && "*"}
            <input
                onChange={onChange}
                name={name}
                type={type}
                required={required}
                className="input-field"
            />
        </label>
    );
};

export default Input;