export default function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button type="button" className={`button button--primary ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
