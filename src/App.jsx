import React, { useEffect, useState } from 'react';
import { ArrowDownWideNarrow, Bean, ChevronDown, Coffee, Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import nutrition from './data/nutrition.json';

const categories = ['All drinks', 'Espresso & coffee', 'Frappuccino', 'Tea', 'Refreshers', 'Other'];
const dimensions = ['size', 'milk', 'whip'];
const dimensionLabels = { size: 'Size', milk: 'Milk', whip: 'Whipped cream' };
const macroFields = [
  ['Calories', 'calories', 'kcal'],
  ['Carbohydrates', 'carbohydrates', 'g'],
  ['Total fat', 'fat', 'g'],
  ['Protein', 'protein', 'g'],
  ['Total sugar', 'sugar', 'g'],
  ['Dietary fiber', 'fiber', 'g'],
  ['Sodium', 'sodium', 'mg'],
  ['Caffeine', 'caffeine', 'mg'],
];

function categoryFor(name) {
  const lower = name.toLowerCase();
  if (lower.includes('frappuccino')) return 'Frappuccino';
  if (lower.includes('refresher') || lower.includes('refreshers')) return 'Refreshers';
  if (lower.includes('tea') || lower.includes('chai') || lower.includes('matcha')) return 'Tea';
  if (/coffee|americano|espresso|latte|mocha|macchiato|cappuccino|cold brew|flat white/.test(lower)) return 'Espresso & coffee';
  return 'Other';
}

function pretty(value, dimension) {
  if (value === 'N/A') return dimension === 'whip' ? 'No whip' : dimension === 'milk' ? 'No milk' : 'Single';
  if (value === 'Whip') return 'With whip';
  if (value === 'No Whip') return 'No whip';
  return value;
}

function bestVariant(rows, sortBy) {
  return [...rows].sort((first, second) => {
    if (sortBy === 'calories') return first.calories - second.calories || first.carbohydrates - second.carbohydrates;
    if (sortBy === 'protein') return second.protein - first.protein || first.carbohydrates - second.carbohydrates;
    if (sortBy === 'name') return first.name.localeCompare(second.name);
    return first.carbohydrates - second.carbohydrates || first.calories - second.calories;
  })[0];
}

function App() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All drinks');
  const [sortBy, setSortBy] = useState('carbohydrates');
  const [mobileView, setMobileView] = useState('browse');
  const [isCarbLimitEnabled, setIsCarbLimitEnabled] = useState(true);
  const [maxCarbs, setMaxCarbs] = useState(20);
  const [selectedName, setSelectedName] = useState('Brewed Coffee');
  const [selectedVariant, setSelectedVariant] = useState(nutrition[0]);

  const groups = Object.values(nutrition.reduce((result, row) => {
    result[row.name] ??= { name: row.name, category: categoryFor(row.name), variants: [] };
    result[row.name].variants.push(row);
    return result;
  }, {}));

  const filteredGroups = groups.map((group) => ({
    ...group,
    variants: group.variants.filter((row) => !isCarbLimitEnabled || row.carbohydrates <= maxCarbs),
  })).filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(search.trim().toLowerCase());
    return group.variants.length > 0 && matchesSearch && (category === 'All drinks' || group.category === category);
  }).sort((first, second) => {
    const a = bestVariant(first.variants, sortBy);
    const b = bestVariant(second.variants, sortBy);
    if (sortBy === 'name') return first.name.localeCompare(second.name);
    if (sortBy === 'calories') return a.calories - b.calories || first.name.localeCompare(second.name);
    if (sortBy === 'protein') return b.protein - a.protein || first.name.localeCompare(second.name);
    return a.carbohydrates - b.carbohydrates || first.name.localeCompare(second.name);
  });

  const selectedGroup = filteredGroups.find((group) => group.name === selectedName) ?? filteredGroups[0];
  const availableVariants = selectedGroup?.variants ?? [];
  const currentVariant = availableVariants.find((row) => dimensions.every((key) => row[key] === selectedVariant?.[key]))
    ?? bestVariant(availableVariants, 'carbohydrates');

  useEffect(() => {
    if (!selectedGroup) return;
    if (selectedGroup.name !== selectedName) setSelectedName(selectedGroup.name);
    if (currentVariant && currentVariant !== selectedVariant) setSelectedVariant(currentVariant);
  }, [selectedGroup, selectedName, currentVariant, selectedVariant]);

  function chooseDrink(group) {
    const nextVariant = bestVariant(group.variants, 'carbohydrates');
    setSelectedName(group.name);
    setSelectedVariant(nextVariant);
    setMobileView('detail');
    if (window.matchMedia('(max-width: 700px)').matches) window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function chooseOption(dimension, value) {
    const matches = availableVariants.filter((row) => row[dimension] === value);
    const nextVariant = [...matches].sort((first, second) => {
      const firstMismatches = dimensions.filter((key) => key !== dimension && first[key] !== currentVariant[key]).length;
      const secondMismatches = dimensions.filter((key) => key !== dimension && second[key] !== currentVariant[key]).length;
      return firstMismatches - secondMismatches || first.carbohydrates - second.carbohydrates || first.calories - second.calories;
    })[0];
    if (nextVariant) setSelectedVariant(nextVariant);
  }

  const visibleCategories = categories.map((label) => ({
    label,
    count: label === 'All drinks' ? groups.filter((group) => group.variants.some((row) => !isCarbLimitEnabled || row.carbohydrates <= maxCarbs)).length
      : groups.filter((group) => group.category === label && group.variants.some((row) => !isCarbLimitEnabled || row.carbohydrates <= maxCarbs)).length,
  }));

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Starbucks PH Macros home">
          <span className="brand-mark"><Bean size={21} strokeWidth={1.8} /></span>
          <span className="brand-word">Starbucks PH Macros</span>
        </a>
        <a className="source-link" href="https://starbucks.ph/docs/CalorieContentandNutriInfoDatabase.pdf" target="_blank" rel="noreferrer">Source PDF <ChevronDown size={14} className="source-arrow" /></a>
      </header>

      <main id="top">
        <section className="intro">
          <div className="intro-copy">
            <h1>Menu &amp; nutrition</h1>
          </div>
        </section>

        <div className={`content-wrap mobile-${mobileView}-view`}>
          <nav className="mobile-tabs" aria-label="Menu views">
            <button type="button" className={mobileView === 'browse' ? 'active' : ''} aria-pressed={mobileView === 'browse'} onClick={() => setMobileView('browse')}>Browse</button>
            <button type="button" className={mobileView === 'detail' ? 'active' : ''} aria-pressed={mobileView === 'detail'} onClick={() => setMobileView('detail')}>Nutrition</button>
          </nav>
          <aside className="sidebar">
            <div className="sidebar-heading"><span>MENU</span><span className="category-count">{groups.length} drinks</span></div>
            <nav className="category-nav" aria-label="Drink categories">
              {visibleCategories.map(({ label, count }) => (
                <button key={label} className={`category-button ${category === label ? 'active' : ''}`} onClick={() => setCategory(label)}>
                  <span>{label}</span><span className="category-count">{count}</span>
                </button>
              ))}
            </nav>
            <div className="sidebar-rule" />
            <div className="filter-title"><SlidersHorizontal size={15} /> LOW-CARB FILTER</div>
            <label className="carb-toggle-row" htmlFor="carb-limit-enabled"><span>Apply carb limit</span><input id="carb-limit-enabled" type="checkbox" checked={isCarbLimitEnabled} onChange={(event) => setIsCarbLimitEnabled(event.target.checked)} /></label>
            <label className={`carb-label ${isCarbLimitEnabled ? '' : 'disabled'}`} htmlFor="carb-limit">Maximum carbs <strong>{isCarbLimitEnabled ? `${maxCarbs}g` : 'Off'}</strong></label>
            <input id="carb-limit" className="carb-range" type="range" min="0" max="100" step="1" value={maxCarbs} disabled={!isCarbLimitEnabled} onChange={(event) => setMaxCarbs(Number(event.target.value))} />
            <div className={`range-labels ${isCarbLimitEnabled ? '' : 'disabled'}`}><span>0g</span><span>100g</span></div>
            <p className="filter-caption">Only show drinks with at least one available customization under your limit.</p>
            <div className="sidebar-tip"><Sparkles size={15} /><span>Nutrition updates as you change size and milk.</span></div>
          </aside>

          <section className="browse" aria-label="Browse drinks">
            <div className="browse-heading">
              <div><div className="section-kicker">THE MENU</div><h2>Choose a drink</h2></div>
              <div className="results-count">{filteredGroups.length} <span>results</span></div>
            </div>
            <div className="toolbar">
              <label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search drinks" aria-label="Search drinks" />{search && <button onClick={() => setSearch('')} aria-label="Clear search">×</button>}</label>
              <label className="sort-box"><ArrowDownWideNarrow size={16} /><span className="sort-label">Sort</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort drinks"><option value="carbohydrates">Lowest carbs</option><option value="calories">Lowest calories</option><option value="protein">Highest protein</option><option value="name">Name A–Z</option></select><ChevronDown size={14} /></label>
            </div>

            <div className="drink-list">
              {filteredGroups.map((group, index) => {
                const best = bestVariant(group.variants, sortBy);
                const active = selectedGroup?.name === group.name;
                return (
                  <button key={group.name} className={`drink-row ${active ? 'selected' : ''}`} onClick={() => chooseDrink(group)} style={{ '--row-index': index }}>
                    <span className={`drink-icon ${group.category === 'Frappuccino' ? 'frozen' : ''}`}><Coffee size={18} strokeWidth={1.7} /></span>
                    <span className="drink-info"><span className="drink-name">{group.name}</span><span className="drink-meta">{group.category} <span>·</span> {group.variants.length} options</span></span>
                    <span className="drink-stats"><strong>{best.carbohydrates}<small>g</small></strong><span>carbs</span></span>
                    <span className="drink-calories">{best.calories}<small> kcal</small></span>
                    <ChevronDown className="row-chevron" size={16} />
                  </button>
                );
              })}
              {filteredGroups.length === 0 && <div className="empty-state"><Search size={22} /><h3>No drinks found</h3><p>Try another search or raise your carb limit.</p><button onClick={() => { setSearch(''); setIsCarbLimitEnabled(false); }}>Show all drinks</button></div>}
            </div>
          </section>

          <aside className="detail-panel" aria-label="Drink customization and nutrition">
            {currentVariant ? <>
              <div className="detail-topline"><span>SELECTED DRINK</span><span>PER CUP</span></div>
              <h2 className="detail-name">{currentVariant.name}</h2>
              <p className="detail-serving">{currentVariant.servingSize === 'N/A' ? 'Single serving' : currentVariant.servingSize || 'Single serving'} <span>·</span> {currentVariant.weight}g beverage</p>
              <div className="customizers">
                {dimensions.map((dimension) => {
                  const options = [...new Set(availableVariants.map((row) => row[dimension]))];
                  if (options.length < 2) return null;
                  return <label className="custom-select" key={dimension}><span>{dimensionLabels[dimension]}</span><span className="select-wrap"><select value={currentVariant[dimension]} onChange={(event) => chooseOption(dimension, event.target.value)}>{options.map((option) => <option key={option} value={option}>{pretty(option, dimension)}</option>)}</select><ChevronDown size={15} /></span></label>;
                })}
              </div>
              <div className="nutrition-title"><span>NUTRITION</span><span>PER CUP</span></div>
              <div className="calorie-feature"><div><span>Energy</span><strong>{currentVariant.calories}<small> kcal</small></strong></div><span className="calorie-glyph"><Sparkles size={18} /></span></div>
              <div className="macro-grid">
                {macroFields.slice(1).map(([label, key, unit]) => <div className={`macro-item ${key === 'carbohydrates' ? 'carb-highlight' : ''}`} key={key}><span>{label}</span><strong>{currentVariant[key]}<small> {unit}</small></strong></div>)}
              </div>
              <div className="detail-footnote">Values shown are for this exact drink, size, and milk combination.</div>
            </> : <div className="detail-empty"><Coffee size={24} /><p>Choose a drink to see its nutrition.</p></div>}
          </aside>
        </div>
      </main>
      <footer className="footer"><span>Personal, non-commercial use only.</span><a href="https://starbucks.ph/docs/CalorieContentandNutriInfoDatabase.pdf" target="_blank" rel="noreferrer">Starbucks Philippines source PDF <span>↗</span></a><span className="footer-disclaimer">Independent project; not affiliated with Starbucks Corporation.</span></footer>
    </div>
  );
}

export default App;