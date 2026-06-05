// ─── Visualization instances ──────────────────────────────────────────────────
let lineChart, timeline, formationVis;
let championTimeline, teamStats, teamComparison;

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
            "field-svg",
            "formation-label",
            "formation-desc",
            "pros-list",
            "cons-list",
            "formation-tooltip",
            "nav-dots",
            "defense-next",
            "defense-prev",
            "help-btn",
            "modal-overlay",
            "modal-close",
            "pos-list"
        );

        formationVis.initVis();

        // ── Vis 3: Champions ──────────────────────────────────────────────────
        championTimeline = new ChampionTimeline("champion-timeline", data);
        teamStats        = new TeamStats("team-stats", data);
        teamComparison   = new TeamComparison("team-comparison", data);

        championTimeline.initVis();
        teamStats.initVis();
        teamComparison.initVis();

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

/*
 * championSelectionChanged — called by ChampionTimeline on every click.
 * selected = array of { year, code, name, color }, length 0–4
 */
function championSelectionChanged(selected) {
    if (!teamStats || !teamComparison) return;

    if (selected.length === 0) {
        // Nothing selected — clear both
        teamStats.setTeam(null);
        teamComparison.setTeams([]);
    } else if (selected.length === 1) {
        // Single selection — show in teamStats, clear comparison
        teamStats.setTeam(selected[0]);
        teamComparison.setTeams([]);
    } else {
        // Multi-selection — first team in single stat, all in comparison
        teamStats.setTeam(selected[0]);
        teamComparison.setTeams(selected);
    }
}