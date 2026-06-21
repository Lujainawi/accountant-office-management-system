export default function FilterBar({ statusLabel, statusValue, onStatusChange, statusOptions, typeLabel, typeValue, onTypeChange, typeOptions, resetLabel, onReset }) {
  return (
    <div className="filter-bar">
      <div className="filter-bar__field">
        <label className="filter-bar__label" htmlFor="client-status-filter">
          {statusLabel}
        </label>
        <select
          id="client-status-filter"
          className="filter-bar__select form-field__input"
          value={statusValue}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-bar__field">
        <label className="filter-bar__label" htmlFor="client-type-filter">
          {typeLabel}
        </label>
        <select
          id="client-type-filter"
          className="filter-bar__select form-field__input"
          value={typeValue}
          onChange={(event) => onTypeChange(event.target.value)}
        >
          {typeOptions.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="filter-bar__actions">
        <button type="button" className="button button--secondary" onClick={onReset}>
          {resetLabel}
        </button>
      </div>
    </div>
  );
}
