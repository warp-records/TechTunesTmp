import { useEffect, useRef, useState } from 'react'

import styles from './Impact.module.css'
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
    <div className={styles['impact-root']}>
      <HomeButton />
      <header className={styles['impact-header']}>
        <h1 className={styles['impact-title']}>IMPACT PAGE</h1>
      </header>

      <main className={styles['impact-page']} aria-labelledby="page-title">
        <div className={styles['filters-row']} ref={filtersRef}>
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
    <div className={styles['filter-group']}>
      <label htmlFor={id} className={styles['filter-label']}>
        {label}
      </label>

      <div className={styles['filter-dropdown']}>
        <button
          id={id}
          className={styles['filter-trigger']}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${id}-menu`}
          onClick={onToggle}
        >
          <span className={value === '' ? [styles['filter-value'], styles['placeholder']].join(' ') : styles['filter-value']}>
            {displayLabel}
          </span>
          <svg
            className={[styles['filter-chevron'], isOpen ? styles['open'] : ''].filter(Boolean).join(' ')}
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
          <ul id={`${id}-menu`} className={styles['filter-menu']} role="listbox">
            {options.map((option) => (
              <li
                key={option.value === '' ? 'empty-option' : option.value}
                className={styles['filter-option-row']}
                role="option"
                aria-selected={value === option.value}
              >
                <button
                  className={[styles['filter-option'], value === option.value ? styles['selected'] : ''].filter(Boolean).join(' ')}
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
    <section className={styles['program-card']}>
      <header className={styles['program-header']}>
        <h2>{title}</h2>
        <p className={styles['program-subtitle']}>{desc}</p>
      </header>

      <div className={styles['action-grid']}>
        {actions.map(({ label, href }) => {
          if (!href) {
            return (
              <button key={label} className={styles['action-btn']} type="button" disabled>
                {label}
              </button>
            )
          }

          return (
            <a
              key={label}
              className={[styles['action-btn'], styles['action-link']].join(' ')}
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
