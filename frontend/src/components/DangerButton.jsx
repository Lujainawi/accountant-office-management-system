export default function DangerButton({ children, className = "", ...props }) {
  return (
    <button type="button" className={`button button--danger ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
