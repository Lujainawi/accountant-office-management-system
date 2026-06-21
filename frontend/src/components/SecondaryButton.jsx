export default function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button type="button" className={`button button--secondary ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
