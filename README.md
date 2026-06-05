# Evolution of the NFL

An interactive data visualization project for CS4460 that explores how modern NFL strategy has shifted from simple run/pass identity toward personnel matchups, formation flexibility, and hybrid athletes.

## Live Site

https://khalidbargoti.github.io/CS4460/

## Project Overview

This project tells the story of how NFL strategy has evolved from 2010–2025. The site walks users through several interactive visualizations that show league-wide offensive trends, formation matchups, player versatility, and championship team personnel usage.

The main goal is to show that the NFL is not just becoming more pass-heavy or more run-heavy. Instead, teams increasingly use personnel groupings, formations, and versatile athletes to create matchup advantages before the play even begins.

## Visualizations

### 1. Run-First vs Pass-First Trends

The first visualization compares how many NFL teams leaned run-first or pass-first across each season. Users can filter the time range with the timeline and hover over dots for season-specific details.

### 2. Formation Matchups

The formation matchup tool lets users compare offensive personnel groups against defensive formations. Users can cycle through matchups and see which side has the advantage, along with a brief explanation of why.

### 3. Hybrid Athlete Profiles

The radar charts compare selected players against positional averages. These charts highlight how modern players can blur traditional position roles by combining size, speed, strength, and versatility.

### 4. Super Bowl Champion Personnel

The champions section connects the previous ideas to winning teams. Users can explore recent Super Bowl champions and compare how their personnel usage changed by season.

## Data

The project uses NFL season-level data from 2010–2025. The dataset includes team and season information used to classify offensive tendencies and compare personnel usage.

Main data file:

```text
data/nfl_season_data_2010_2025.csv
```

## Technologies Used

* HTML
* CSS
* JavaScript
* D3.js
* Bootstrap
* GitHub Pages

## How to Run Locally

Clone or download the repository, then open `index.html` in a browser.

For the best experience, run the project through a local development server. For example, using Python:

```bash
python3 -m http.server
```

Then open the local server URL in your browser.

## File Structure

```text
CS4460/
  index.html
  css/
    style.css
    field-scroll-bg.css
  js/
    main.js
    linechart.js
    timeline.js
    formation.js
    radar.js
    championTimeline.js
    teamStats.js
    teamComparison.js
  data/
    nfl_season_data_2010_2025.csv
  README.md
```

## Author

Khalid Bargoti, Christian Tyler Sung Won Chin, and Carlos Robinson

## Course

CS4460 - Information Visualization

