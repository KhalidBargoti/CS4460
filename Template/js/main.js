// ─── Visualization instances ──────────────────────────────────────────────────
let lineChart, timeline, formationVis;

loadData();

function loadData() {
    d3.csv("data/nfl_season_data_2010_2025.csv").then(csvData => {

        let data = prepForUse(csvData);
        console.log('NFL data loaded:', data.length, 'rows');

        // ── Vis 1: line chart + timeline ──────────────────────────────────────
        lineChart = new LineChart("stacked-area-chart", data);
        timeline  = new TimelineVis("timeline", data);

        lineChart.initVis();
        timeline.initVis();

        // ── Vis 2: defensive formations ───────────────────────────────────────
        formationVis = new FormationVis(
            'field-svg',          // SVG element
            'formation-label',    // formation name div
            'formation-desc',     // formation desc div
            'pros-list',          // pros ul
            'cons-list',          // cons ul
            'formation-tooltip',  // tooltip div
            'nav-dots',           // nav dots container
            'whistle-btn',        // whistle button
            'help-btn',           // ? button
            'modal-overlay',      // modal overlay
            'modal-close',        // modal close button
            'pos-list'            // modal position list
        );

        formationVis.initVis();
    });
}

/*
 * prepForUse — coerces raw CSV strings to numbers with the +var pattern.
 * run_first_label kept as a string category.
 */
function prepForUse(rawData) {
    let parseDate = d3.timeParse("%Y");
    return rawData.map(d => ({
        season:                  parseDate(d.season),
        team:                    d.team,
        rush_attempts:           +d.rush_attempts,
        pass_rate:               +d.pass_rate,
        rush_rate:               +d.rush_rate,
        epa_per_pass:            +d.epa_per_pass,
        epa_per_rush:            +d.epa_per_rush,
        rush_success_rate:       +d.rush_success_rate,
        pass_success_rate:       +d.pass_success_rate,
        yards_per_carry:         +d.yards_per_carry,
        pct_off_10_personnel:    +d.pct_off_10_personnel,
        pct_off_11_personnel:    +d.pct_off_11_personnel,
        pct_off_12_personnel:    +d.pct_off_12_personnel,
        pct_off_13_personnel:    +d.pct_off_13_personnel,
        pct_off_21_personnel:    +d.pct_off_21_personnel,
        pct_off_22_personnel:    +d.pct_off_22_personnel,
        avg_box_count_on_rush:   +d.avg_box_count_on_rush,
        epa_per_rush_vs_base:    +d.epa_per_rush_vs_base,
        epa_per_rush_vs_nickel:  +d.epa_per_rush_vs_nickel,
        epa_per_rush_vs_dime:    +d.epa_per_rush_vs_dime,
        pct_def_base:            +d.pct_def_base,
        pct_def_nickel:          +d.pct_def_nickel,
        pct_def_dime:            +d.pct_def_dime,
        avg_db_weight:           +d.avg_db_weight,
        avg_lb_weight:           +d.avg_lb_weight,
        avg_height_in_db:        +d.avg_height_in_db,
        avg_height_in_lb:        +d.avg_height_in_lb,
        avg_forty_lb:            +d.avg_forty_lb,
        avg_forty_db:            +d.avg_forty_db,
        team_rushing_rank:       +d.team_rushing_rank,
        run_first_label:          d.run_first_label
    }));
}

/*
 * brushed — called by TimelineVis when either handle is dragged.
 * Passes the current [startYear, endYear] selection to the line chart.
 */
function brushed(selectionRange) {
    lineChart.filterByRange(selectionRange);
}