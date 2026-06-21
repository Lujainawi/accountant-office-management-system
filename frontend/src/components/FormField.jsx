export default function FormField({
  id,
  label,
  required = false,
  error,
  children,
  hint,
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={id}>
        {label}
        {required ? <span className="form-field__required"> *</span> : null}
      </label>
      {children}
      {hint ? <p className="form-field__hint">{hint}</p> : null}
      {error ? (
        <p id={errorId} className="form-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
