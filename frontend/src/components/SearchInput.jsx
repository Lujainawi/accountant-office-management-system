export default function SearchInput({ id, label, value, onChange, placeholder }) {
  return (
    <div className="search-input">
      <label className="search-input__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="search-input__field form-field__input"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
