import React from 'react';
import { MdFilterList, MdClear } from 'react-icons/md';
import './RideFilterPanel.css';

function RideFilterPanel({ filterValues, onFilterChange, onApplyFilters, onClearFilters }) {
  return (
    <div className="filters-panel">
      <div className="filters-header">
        <h3>Filtruj przejazdy</h3>
      </div>
      
      <div className="filters-grid">
        <input 
          type="text" 
          name="origin"
          placeholder="Miejsce wyjazdu" 
          value={filterValues.origin}
          onChange={onFilterChange}
          className="filter-input"
        />
        <input 
          type="text" 
          name="destination"
          placeholder="Miejsce docelowe" 
          value={filterValues.destination}
          onChange={onFilterChange}
          className="filter-input"
        />
        <input 
          type="date" 
          name="date"
          value={filterValues.date}
          onChange={onFilterChange}
          className="filter-input"
        />
      </div>

      <div className="filters-actions">
        <button className="filter-btn apply" onClick={onApplyFilters}>
          <MdFilterList /> Filtruj
        </button>
        <button className="filter-btn clear" onClick={onClearFilters}>
          <MdClear /> Wyczyść filtry
        </button>
      </div>
    </div>
  );
}

export default RideFilterPanel;