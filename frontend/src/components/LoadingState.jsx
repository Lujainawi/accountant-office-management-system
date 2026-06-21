import { ui } from "../content/he";

export default function LoadingState({ message = ui.loading }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className="loading-state__spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
