/*
 * TeamComparison – ES6 Class
 *
 * Grouped vertical bar chart comparing up to 4 champion seasons side-by-side.
 * Left panel  = Offense personnel packages
 * Right panel = Defensive formation usage
 *
 * Each selected team gets a consistent color from ChampionTimeline.
 * Adding a team animates a new bar growing up; removing shrinks it away.
 * If a team appears multiple times (same code, different years) it is labelled
 * "{CODE} ({year})" in the legend.
 *
 * Shows "SELECT MULTIPLE TEAMS" when fewer than 2 teams are chosen.
 *
 * @param parentElement  id of the container div
 * @param data           full prepared dataset
 */
class TeamComparison {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data          = data;
        this.teams         = [];   // array of { year, code, name, color }

        this.OFF_FIELDS = [
            { key:'pct_off_10_personnel', label:'10 Per.' },
            { key:'pct_off_11_personnel', label:'11 Per.' },
            { key:'pct_off_12_personnel', label:'12 Per.' },
            { key:'pct_off_13_personnel', label:'13 Per.' },
            { key:'pct_off_21_personnel', label:'21 Per.' },
            { key:'pct_off_22_personnel', label:'22 Per.' },
        ];

        this.DEF_FIELDS = [
            { key:'pct_def_base',   label:'Base'   },
            { key:'pct_def_nickel', label:'Nickel' },
            { key:'pct_def_dime',   label:'Dime'   },
        ];
    }

    // ── initVis ──────────────────────────────────────────────────────────────
    initVis() {
        let vis = this;

        vis.margin = { top: 60, right: 20, bottom: 60, left: 20 };

        const el = document.getElementById(vis.parentElement);
        vis.totalW = el.getBoundingClientRect().width;
        vis.totalH = el.getBoundingClientRect().height;
        vis.width  = vis.totalW - vis.margin.left - vis.margin.right;
        vis.height = vis.totalH - vis.margin.top  - vis.margin.bottom;

        vis.svg = d3.select('#' + vis.parentElement).append('svg')
            .attr('width',  vis.totalW)
            .attr('height', vis.totalH);

        vis.g = vis.svg.append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        vis.halfW = vis.width / 2;

        // Section headers
        vis._addHeader('OFFENSE', vis.halfW / 2,      -42);
        vis._addHeader('DEFENSE', vis.halfW * 1.5,    -42);

        // Divider
        vis.g.append('line')
            .attr('x1', vis.halfW).attr('y1', -30)
            .attr('x2', vis.halfW).attr('y2', vis.height + 46)
            .attr('stroke', '#1e293b').attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '4,3');

        // Y scale (shared, updated per dataset)
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // Left y-axis (offense panel)
        vis.yAxisLeft = vis.g.append('g').attr('class', 'cmp-y-axis-left');

        // Right y-axis (defense panel)
        vis.yAxisRight = vis.g.append('g')
            .attr('class', 'cmp-y-axis-right')
            .attr('transform', `translate(${vis.width}, 0)`);

        // Empty state text
        vis.emptyText = vis.svg.append('text')
            .attr('x', vis.totalW / 2).attr('y', vis.totalH / 2)
            .attr('text-anchor', 'middle')
            .attr('fill', '#334155')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '20px')
            .attr('font-weight', '600')
            .attr('letter-spacing', '.08em')
            .text('SELECT MULTIPLE TEAMS');

        // Legend group (bottom)
        vis.legendG = vis.svg.append('g')
            .attr('transform', `translate(${vis.margin.left}, ${vis.totalH - 22})`);

        vis.wrangleData();
    }

    // ── wrangleData ───────────────────────────────────────────────────────────
    wrangleData() {
        let vis = this;

        // Build rows from data for each selected team
        vis.teamRows = vis.teams.map(t => {
            const row = vis.data.find(d => {
                const y = d.season instanceof Date ? d.season.getFullYear() : +d.season;
                return y === t.year && d.team === t.code;
            });
            return { ...t, row: row || null };
        });

        vis.updateVis();
    }

    // ── updateVis ─────────────────────────────────────────────────────────────
    updateVis() {
        let vis = this;
        const show = vis.teams.length >= 2;

        vis.emptyText.attr('opacity', show ? 0 : 1);
        if (!show) {
            vis.g.selectAll('.cmp-bar-off, .cmp-bar-def, .cmp-xlbl-off, .cmp-xlbl-def').remove();
            vis._updateLegend();
            return;
        }

        // Shared y-domain: max across all values in both panels
        const allVals = [];
        vis.teamRows.forEach(tr => {
            if (!tr.row) return;
            vis.OFF_FIELDS.forEach(f => allVals.push(+tr.row[f.key] || 0));
            vis.DEF_FIELDS.forEach(f => allVals.push(+tr.row[f.key] || 0));
        });
        vis.y.domain([0, d3.max(allVals) * 1.12 || 0.01]);

        // Update both y-axes with percentage ticks (0%, 25%, 50%, 75%, 100% of max)
        const yAxisFmt = d => `${(d * 100).toFixed(0)}%`;
        vis.yAxisLeft.call(
            d3.axisLeft(vis.y)
                .ticks(4)
                .tickFormat(yAxisFmt)
                .tickSize(-4)
        );
        vis.yAxisLeft.selectAll('path, line').attr('stroke', '#1e293b');
        vis.yAxisLeft.selectAll('text')
            .attr('fill', '#475569')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '9px');

        vis.yAxisRight.call(
            d3.axisRight(vis.y)
                .ticks(4)
                .tickFormat(yAxisFmt)
                .tickSize(4)
        );
        vis.yAxisRight.selectAll('path, line').attr('stroke', '#1e293b');
        vis.yAxisRight.selectAll('text')
            .attr('fill', '#475569')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '9px');

        const t = d3.transition().duration(500).ease(d3.easeQuadOut);

        vis._drawPanel('off', vis.OFF_FIELDS, 0,            vis.halfW - 8,  t);
        vis._drawPanel('def', vis.DEF_FIELDS, vis.halfW + 8, vis.width,     t);
        vis._updateLegend();
    }

    // ── Draw one panel (off or def) ───────────────────────────────────────────
    _drawPanel(side, fields, panelX, panelRight, t) {
        let vis = this;
        const panelW   = panelRight - panelX;
        const nGroups  = fields.length;
        const nTeams   = vis.teams.length;

        // Outer band: one slot per stat
        const xGroup = d3.scaleBand()
            .domain(fields.map(f => f.key))
            .range([panelX, panelRight])
            .padding(0.22);

        // Inner band: one slot per team within each stat
        const xTeam = d3.scaleBand()
            .domain(vis.teams.map((_, i) => i))
            .range([0, xGroup.bandwidth()])
            .padding(0.08);

        // ── Bars ──────────────────────────────────────────────────────────
        const barClass = `cmp-bar-${side}`;

        // Build flat data: one entry per {field, teamIdx}
        const barData = [];
        fields.forEach(f => {
            vis.teamRows.forEach((tr, ti) => {
                barData.push({
                    key:    f.key,
                    teamIdx: ti,
                    val:    tr.row ? (+tr.row[f.key] || 0) : 0,
                    color:  tr.color,
                    id:     `${side}-${f.key}-${tr.year}-${tr.code}`
                });
            });
        });

        const bars = vis.g.selectAll(`.${barClass}`).data(barData, d => d.id);

        // ENTER: bars start at height 0 at the bottom
        bars.enter().append('rect')
            .attr('class', barClass)
            .attr('x',      d => xGroup(d.key) + xTeam(d.teamIdx))
            .attr('y',      vis.height)
            .attr('width',  xTeam.bandwidth())
            .attr('height', 0)
            .attr('fill',   d => d.color)
            .attr('opacity', 0.82)
            .merge(bars)
            .transition(t)
            .attr('x',      d => xGroup(d.key) + xTeam(d.teamIdx))
            .attr('y',      d => vis.y(d.val))
            .attr('width',  xTeam.bandwidth())
            .attr('height', d => vis.height - vis.y(d.val))
            .attr('fill',   d => d.color);

        bars.exit()
            .transition(t)
            .attr('y', vis.height).attr('height', 0).attr('opacity', 0)
            .remove();

        // ── X-axis labels (stat names, below bars) ─────────────────────────
        const lblClass = `cmp-xlbl-${side}`;
        const lblData  = fields.map(f => f);

        const lbls = vis.g.selectAll(`.${lblClass}`).data(lblData, d => d.key);

        lbls.enter().append('text')
            .attr('class', lblClass)
            .merge(lbls)
            .attr('x', d => xGroup(d.key) + xGroup.bandwidth() / 2)
            .attr('y', vis.height + 14)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size',  '10px')
            .attr('fill', '#475569')
            .text(d => d.label);

        lbls.exit().remove();
    }

    // ── Legend ────────────────────────────────────────────────────────────────
    _updateLegend() {
        let vis = this;
        vis.legendG.selectAll('*').remove();

        // detect duplicate team codes
        const codeCounts = {};
        vis.teams.forEach(t => {
            codeCounts[t.code] = (codeCounts[t.code] || 0) + 1;
        });

        let xCursor = 0;
        vis.teams.forEach(t => {
            const label = codeCounts[t.code] > 1
                ? `${t.code} (${t.year})`
                : `${t.code}: ${t.name}`;

            vis.legendG.append('circle')
                .attr('cx', xCursor + 6).attr('cy', 0)
                .attr('r', 5)
                .attr('fill', t.color);

            const txt = vis.legendG.append('text')
                .attr('x', xCursor + 15)
                .attr('y', 0)
                .attr('dy', '0.35em')
                .attr('font-family', 'Barlow Condensed, sans-serif')
                .attr('font-size', '11px')
                .attr('fill', t.color)
                .text(label);

            xCursor += 16 + (label.length * 7);
        });
    }

    // ── Public: update the teams array ────────────────────────────────────────
    setTeams(teams) {
        this.teams = teams;
        this.wrangleData();
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    _addHeader(label, x, y) {
        this.g.append('text')
            .attr('x', x).attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '11px')
            .attr('font-weight', '700')
            .attr('letter-spacing', '.15em')
            .attr('fill', '#475569')
            .text(label);
    }
}