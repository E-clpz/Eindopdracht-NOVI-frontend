import "./Input.css";

const Input = ({ label, type, required }) => {
    return (
        <label className="input-label">
            {label} {required && "*"}
            <input type={type} required={required} className="input-field" />
        </label>
    );
};

export default Input;