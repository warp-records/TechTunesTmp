import { useEffect, useRef, useState } from 'react'

import './Impact.css'
import HomeButton from '../components/HomeButton'
import { CITY_REGIONS, PROGRAMS_BY_ID } from './impactData'

export default function Impact() {
  const [selectedCity, setSelectedCity] = useState('Philadelphia')
  const [selectedRegionId, setSelectedRegionId] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null)
  const filtersRef = useRef(null)

  const cityOptions = Object.keys(CITY_REGIONS)
  const regionOptions = CITY_REGIONS[selectedCity] ?? []
  const programs = Object.values(PROGRAMS_BY_ID)
  const filteredPrograms =
    selectedRegionId === ''
      ? []
      : programs.filter(
          (program) =>
            program.city === selectedCity &&
            program.regionIds.includes(selectedRegionId)
        )

  useEffect(() => {
    function handlePointerDown(event) {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setOpenDropdown(null)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function handleCitySelect(city) {
    setSelectedCity(city)
    setSelectedRegionId('')
    setOpenDropdown(null)
  }

  function handleRegionSelect(region) {
    setSelectedRegionId(region)
    setOpenDropdown(null)
  }

  function toggleDropdown(name) {
    setOpenDropdown((prev) => (prev === name ? null : name))
  }

  return (
    <div className="impact-root">
      <HomeButton />
      <header className="impact-header">
        <h1 className="impact-title">IMPACT PAGE</h1>
      </header>

      <main className="impact-page" aria-labelledby="page-title">
        <div className="filters-row" ref={filtersRef}>
          <FilterDropdown
            id="city-filter"
            label="City"
            value={selectedCity}
            options={cityOptions.map((city) => ({ value: city, label: city }))}
            isOpen={openDropdown === 'city'}
            onToggle={() => toggleDropdown('city')}
            onSelect={handleCitySelect}
          />

          <FilterDropdown
            id="region-filter"
            label="Region"
            value={selectedRegionId}
            options={[
              { value: '', label: '-' },
              ...regionOptions.map((region) => ({
                value: region.regionId,
                label: region.regionName,
              })),
            ]}
            isOpen={openDropdown === 'region'}
            onToggle={() => toggleDropdown('region')}
            onSelect={handleRegionSelect}
          />
        </div>

        {filteredPrograms.map((program) => (
          <ProgramCard
            key={program.id}
            title={program.title}
            desc={program.desc}
            actions={program.actions}
          />
        ))}
      </main>
    </div>
  )
}

export function FilterDropdown({
  id,
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}) {
  const selectedOption = options.find((option) => option.value === value)
  const displayLabel = selectedOption ? selectedOption.label : '-'

  return (
    <div className="filter-group">
      <label htmlFor={id} className="filter-label">
        {label}
      </label>

      <div className="filter-dropdown">
        <button
          id={id}
          className="filter-trigger"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${id}-menu`}
          onClick={onToggle}
        >
          <span className={value === '' ? 'filter-value placeholder' : 'filter-value'}>
            {displayLabel}
          </span>
          <svg
            className={`filter-chevron ${isOpen ? 'open' : ''}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M6 9l6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {isOpen && (
          <ul id={`${id}-menu`} className="filter-menu" role="listbox">
            {options.map((option) => (
              <li
                key={option.value === '' ? 'empty-option' : option.value}
                className="filter-option-row"
                role="option"
                aria-selected={value === option.value}
              >
                <button
                  className={`filter-option ${value === option.value ? 'selected' : ''}`}
                  type="button"
                  onClick={() => onSelect(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function ProgramCard({ title, desc, actions }) {
  return (
    <section className="program-card">
      <header className="program-header">
        <h2>{title}</h2>
        <p className="program-subtitle">{desc}</p>
      </header>

      <div className="action-grid">
        {actions.map(({ label, href }) => {
          if (!href) {
            return (
              <button key={label} className="action-btn" type="button" disabled>
                {label}
              </button>
            )
          }

          return (
            <a
              key={label}
              className="action-btn action-link"
              href={href}
              target="_blank"
              rel="noreferrer"
            >
              {label}
            </a>
          )
        })}
      </div>
    </section>
  )
}
