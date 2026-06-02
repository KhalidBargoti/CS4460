/*
 * TeamStats – ES6 Class
 *
 * Horizontal back-to-back bar chart.
 * Left chart  = Offense personnel packages (bars grow LEFT from centre)
 * Right chart = Defensive formation usage  (bars grow RIGHT from centre)
 *
 * Driven by ChampionTimeline single-click selection.
 * If nothing is selected, shows an empty "Select a team" state.
 *
 * @param parentElement  id of the container div
 * @param data           full prepared dataset
 */
class TeamStats {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data          = data;
        this.teamEntry     = null;  // { year, code, name, color } | null

        // Display-friendly labels
        this.OFF_FIELDS = [
            { key:'pct_off_10_personnel', label:'10 Personnel  (4 WR, 1 TE)' },
            { key:'pct_off_11_personnel', label:'11 Personnel  (3 WR, 1 TE)' },
            { key:'pct_off_12_personnel', label:'12 Personnel  (2 WR, 2 TE)' },
            { key:'pct_off_13_personnel', label:'13 Personnel  (1 WR, 3 TE)' },
            { key:'pct_off_21_personnel', label:'21 Personnel  (2 WR, 1 TE, 1 FB)' },
            { key:'pct_off_22_personnel', label:'22 Personnel  (2 WR, 2 TE, 1 FB)' },
        ];

        this.DEF_FIELDS = [
            { key:'pct_def_base',   label:'Base (4-3 / 3-4)' },
            { key:'pct_def_nickel', label:'Nickel (5 DB)'     },
            { key:'pct_def_dime',   label:'Dime (6 DB)'       },
        ];
    }

    // ── initVis ──────────────────────────────────────────────────────────────
    initVis() {
        let vis = this;

        vis.margin = { top: 64, right: 16, bottom: 20, left: 16 };

        const el = document.getElementById(vis.parentElement);
        vis.totalWidth  = el.getBoundingClientRect().width;
        vis.totalHeight = el.getBoundingClientRect().height;
        vis.width  = vis.totalWidth  - vis.margin.left - vis.margin.right;
        vis.height = vis.totalHeight - vis.margin.top  - vis.margin.bottom;

        vis.svg = d3.select('#' + vis.parentElement).append('svg')
            .attr('width',  vis.totalWidth)
            .attr('height', vis.totalHeight);

        // Main g shifted by margin
        vis.g = vis.svg.append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        // Half-widths: leave room for centre labels
        vis.halfW = vis.width / 2;

        // Scales (domains set in updateVis)
        // xOff maps [0,max] → [halfW-10, 0]: 0 val → at center, max val → at left edge
        vis.xOff = d3.scaleLinear().range([vis.halfW - 10, 0]);   // offense: bars go LEFT
        vis.xDef = d3.scaleLinear().range([0, vis.halfW - 10]);   // defense: bars go RIGHT

        vis.yOff = d3.scaleBand()
            .domain(vis.OFF_FIELDS.map(f => f.key))
            .range([0, vis.height])
            .padding(0.38);

        vis.yDef = d3.scaleBand()
            .domain(vis.DEF_FIELDS.map(f => f.key))
            .range([0, vis.height])
            .padding(0.25);

        // Section headers
        vis._addSectionHeader('OFFENSE', vis.halfW / 2, 20);
        vis._addSectionHeader('DEFENSE', vis.halfW + vis.halfW / 2, 20);

        // Divider line
        vis.g.append('line')
            .attr('x1', vis.halfW).attr('y1', -10)
            .attr('x2', vis.halfW).attr('y2', vis.height)
            .attr('stroke', '#1e293b').attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '4,3');

        // Empty state text
        vis.emptyText = vis.svg.append('text')
            .attr('class', 'empty-state-text')
            .attr('x', vis.totalWidth / 2)
            .attr('y', vis.totalHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', '#334155')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '20px')
            .attr('font-weight', '600')
            .attr('letter-spacing', '.08em')
            .text('SELECT A TEAM');

        // Team name header
        vis.teamHeader = vis.svg.append('text')
            .attr('class', 'team-header-text')
            .attr('x', vis.totalWidth / 2)
            .attr('y', 22)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '16px')
            .attr('font-weight', '700')
            .attr('letter-spacing', '.1em')
            .attr('fill', '#e2e8f0')
            .attr('opacity', 0);

        vis.wrangleData();
    }

    // ── wrangleData ───────────────────────────────────────────────────────────
    wrangleData() {
        let vis = this;

        if (!vis.teamEntry) {
            vis.displayRow = null;
            vis.updateVis();
            return;
        }

        const { year, code } = vis.teamEntry;
        const row = vis.data.find(d => {
            const y = d.season instanceof Date ? d.season.getFullYear() : +d.season;
            return y === year && d.team === code;
        });

        vis.displayRow = row || null;
        vis.updateVis();
    }

    // ── updateVis ─────────────────────────────────────────────────────────────
    updateVis() {
        let vis = this;
        const hasData = vis.displayRow !== null;
        const color   = vis.teamEntry ? vis.teamEntry.color : '#38bdf8';

        vis.emptyText.attr('opacity', hasData ? 0 : 1);
        vis.teamHeader.attr('opacity', hasData ? 1 : 0);

        if (!hasData) {
            vis.g.selectAll('.bar-off, .bar-def, .label-off, .label-def, .val-off, .val-def').remove();
            return;
        }

        const row = vis.displayRow;
        const { year, code, name } = vis.teamEntry;

        vis.teamHeader
            .text(`${code}  ·  ${name}  ·  ${year}`)
            .attr('fill', color);

        // Build value arrays
        const offVals = vis.OFF_FIELDS.map(f => ({
            key:   f.key,
            label: f.label,
            val:   +row[f.key] || 0
        }));
        const defVals = vis.DEF_FIELDS.map(f => ({
            key:   f.key,
            label: f.label,
            val:   +row[f.key] || 0
        }));

        // Domains: xOff [0,max] with range [halfW-10, 0] means 0→center, max→left edge
        const offMax = d3.max(offVals, d => d.val) || 0.01;
        const defMax = d3.max(defVals, d => d.val) || 0.01;
        vis.xOff.domain([0, offMax]);
        vis.xDef.domain([0, defMax]);

        const t = d3.transition().duration(500).ease(d3.easeQuadOut);

        // Remove and redraw all bars fresh each update to avoid stale scale issues
        vis.g.selectAll('.bar-off, .bar-def, .label-off, .label-def, .val-off, .val-def').remove();

        // ── Offense bars ─────────────────────────────────────────────────
        const barOff = vis.g.selectAll('.bar-off').data(offVals, d => d.key);

        barOff.enter().append('rect')
            .attr('class', 'bar-off')
            .attr('x', vis.halfW - 10)
            .attr('y', d => vis.yOff(d.key) + (vis.yOff.bandwidth() - 14) / 2)
            .attr('height', 14)
            .attr('width', 0)
            .attr('fill', color)
            .attr('opacity', 0.8)
            .transition(t)
            .attr('x', d => vis.xOff(d.val))
            .attr('width', d => (vis.halfW - 10) - vis.xOff(d.val))
            .attr('fill', color);

        // Off bar labels — sit above the bar row, right-aligned to center line
        vis.g.selectAll('.label-off').data(offVals).enter().append('text')
            .attr('class', 'label-off')
            .attr('x', vis.halfW - 14)
            .attr('y', d => vis.yOff(d.key))
            .attr('dy', '-0.25em')
            .attr('text-anchor', 'end')
            .attr('font-family', 'Barlow, sans-serif')
            .attr('font-size', '10px')
            .attr('fill', '#64748b')
            .text(d => d.label);

        // Off value labels — clamped so they never go past x=2
        vis.g.selectAll('.val-off').data(offVals).enter().append('text')
            .attr('class', 'val-off')
            .attr('x', vis.halfW - 14)
            .attr('y', d => vis.yOff(d.key) + vis.yOff.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '10px')
            .attr('fill', color)
            .transition(t)
            .attr('x', d => Math.max(2, vis.xOff(d.val) - 4))
            .text(d => d.val > 0 ? `${(d.val * 100).toFixed(1)}%` : '—');

        // ── Defense bars ─────────────────────────────────────────────────
        vis.g.selectAll('.bar-def').data(defVals).enter().append('rect')
            .attr('class', 'bar-def')
            .attr('x', vis.halfW + 10)
            .attr('y', d => vis.yDef(d.key) + (vis.yDef.bandwidth() - 14) / 2)
            .attr('height', 14)
            .attr('width', 0)
            .attr('fill', color)
            .attr('opacity', 0.8)
            .transition(t)
            .attr('width', d => vis.xDef(d.val))
            .attr('fill', color);

        // Def bar labels
        vis.g.selectAll('.label-def').data(defVals).enter().append('text')
            .attr('class', 'label-def')
            .attr('x', vis.halfW * 2)
            .attr('y', d => vis.yDef(d.key) + vis.yDef.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .attr('font-family', 'Barlow, sans-serif')
            .attr('font-size', '10px')
            .attr('fill', '#64748b')
            .text(d => d.label);

        // Def value labels
        vis.g.selectAll('.val-def').data(defVals).enter().append('text')
            .attr('class', 'val-def')
            .attr('x', vis.halfW + 12)
            .attr('y', d => vis.yDef(d.key) + vis.yDef.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'start')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '10px')
            .attr('fill', color)
            .transition(t)
            .attr('x', d => vis.halfW + 10 + vis.xDef(d.val) + 4)
            .text(d => d.val > 0 ? `${(d.val * 100).toFixed(1)}%` : '—');
    }

    // ── Public: set the active team ───────────────────────────────────────────
    setTeam(entry) {
        this.teamEntry = entry;   // { year, code, name, color } | null
        this.wrangleData();
    }

    // ── Helper: section header ────────────────────────────────────────────────
    _addSectionHeader(label, cx, y) {
        this.g.append('text')
            .attr('x', cx)
            .attr('y', -32)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '11px')
            .attr('font-weight', '700')
            .attr('letter-spacing', '.15em')
            .attr('fill', '#475569')
            .text(label);
    }
}