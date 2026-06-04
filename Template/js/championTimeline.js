/*
 * ChampionTimeline – ES6 Class  (HORIZONTAL layout)
 *
 * Horizontal timeline of Super Bowl champions 2010–2025.
 * Each year is a dot along a left→right track.
 * Single-click selects one team   → drives TeamStats (single stat vis)
 * Cmd/Ctrl-click adds to selection → drives TeamComparison (multi stat vis)
 * Max 4 selections; exceeding shows a toast warning.
 *
 * @param parentElement  id of the container div
 * @param data           full prepared dataset (one row per team-season)
 */
class ChampionTimeline {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data          = data;
        this.selected      = [];   // [{year, team, name, color}]
        this.MAX_SELECT    = 4;

        this.CHAMPIONS = [
            { year:2016, code:'NE', name:'Patriots', versatilePlayers:['James White', 'Julian Edelman', 'Dont’a Hightower'] },
            { year:2017, code:'PHI', name:'Eagles', versatilePlayers:['Zach Ertz', 'Malcolm Jenkins',] },
            { year:2018, code:'NE', name:'Patriots', versatilePlayers:[, 'Julian Edelman', 'Patrick Chung'] },
            { year:2019, code:'KC', name:'Chiefs', versatilePlayers:['Travis Kelce', 'Tyreek Hill', 'Tyrann Mathieu'] },
            { year:2020, code:'TB', name:'Buccaneers', versatilePlayers:['Rob Gronkowski', 'Antoine Winfield', 'Lavonte David'] },
            { year:2021, code:'LA', name:'Rams', versatilePlayers:['Cooper Kupp', 'Aaron Donald.', 'Jalen Ramsey'] },
            { year:2022, code:'KC', name:'Chiefs', versatilePlayers:['Travis Kelce', 'L’Jarius Sneed'] },
            { year:2023, code:'KC', name:'Chiefs', versatilePlayers:['Travis Kelce', 'Trent McDuffie'] },
            { year:2024, code:'PHI', name:'Eagles', versatilePlayers:['Saquon Barkley', 'A.J. Brown', 'Cooper DeJean'] },
            { year:2025, code:'SEA', name:'Seahawks', versatilePlayers:['Nick Emmanwori', 'AJ Barner', 'Devon Witherspoon'] }
        ];
        this.DOT_COLORS = [
            '#38bdf8','#f59e0b','#4ade80','#f87171',
            '#a78bfa','#fb923c','#34d399','#e879f9',
            '#60a5fa','#facc15'
        ];

        this.CHAMPIONS.forEach((c,i) => c.color = this.DOT_COLORS[i]);
    }

    // ── initVis ──────────────────────────────────────────────────────────────
    initVis() {
        let vis = this;

        vis.margin = { top: 42, right: 20, bottom: 18, left: 20 };

        const el = document.getElementById(vis.parentElement);
        vis.width  = el.getBoundingClientRect().width  - vis.margin.left - vis.margin.right;
        vis.height = el.getBoundingClientRect().height - vis.margin.top  - vis.margin.bottom;

        vis.svg = d3.select('#' + vis.parentElement).append('svg')
            .attr('width',  vis.width  + vis.margin.left + vis.margin.right)
            .attr('height', vis.height + vis.margin.top  + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate(${vis.margin.left},${vis.margin.top})`);

        vis.tooltip = d3.select("body")
            .append("div")
            .attr("id", "champion-tooltip")
            .attr("class", "champion-tooltip");

        // Horizontal scale: year → x pixel
        vis.x = d3.scalePoint()
            .domain(vis.CHAMPIONS.map(d => d.year))
            .range([0, vis.width])
            .padding(0.4);

        // Centre y for the track + dots
        vis.cy = vis.height / 2;

        // Track line
        vis.svg.append('line')
            .attr('class', 'champ-track')
            .attr('x1', 0).attr('x2', vis.width)
            .attr('y1', vis.cy).attr('y2', vis.cy)
            .attr('stroke', '#1e293b').attr('stroke-width', 3)
            .attr('stroke-linecap', 'round');

        vis.wrangleData();
    }

    // ── wrangleData ───────────────────────────────────────────────────────────
    wrangleData() {
        this.updateVis();
    }

    // ── updateVis ─────────────────────────────────────────────────────────────
    updateVis() {
        let vis = this;
        const cy = vis.cy;

        // ── Year label (above dot) ────────────────────────────────────────
        const yearLabels = vis.svg.selectAll('.champ-year')
            .data(vis.CHAMPIONS, d => d.year);

        yearLabels.enter().append('text')
            .attr('class', 'champ-year')
            .merge(yearLabels)
            .attr('x', d => vis.x(d.year))
            .attr('y', cy - 18)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .attr('fill', '#475569')
            .text(d => d.year);

        // ── Dots ──────────────────────────────────────────────────────────
        const dots = vis.svg.selectAll('.champ-dot')
            .data(vis.CHAMPIONS, d => d.year);

        const enterDots = dots.enter().append('circle')
            .attr('class', 'champ-dot')
            .attr('cy', cy)
            .attr('r', 9)
            .style('cursor', 'pointer');

        enterDots.merge(dots)
            .attr('cx', d => vis.x(d.year))
            .attr('fill', d => vis._isSelected(d) ? d.color : d.color + '33')
            .attr('stroke', d => d.color)
            .attr('stroke-width', d => vis._isSelected(d) ? 2.5 : 1.5)
            .on('mouseover', function(event, d) {
                vis._showTooltip(event, d);
            })
            .on('mousemove', function(event, d) {
                vis._moveTooltip(event);
            })
            .on('mouseleave', function() {
                vis._hideTooltip();
            })
            .on('click', (event, d) => vis._handleClick(event, d));

        // ── Team label (below dot) ────────────────────────────────────────
        const teamLabels = vis.svg.selectAll('.champ-team')
            .data(vis.CHAMPIONS, d => d.year);

        teamLabels.enter().append('text')
            .attr('class', 'champ-team')
            .merge(teamLabels)
            .attr('x', d => vis.x(d.year))
            .attr('y', cy + 22)
            .attr('text-anchor', 'middle')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '10px')
            .attr('font-weight', d => vis._isSelected(d) ? '700' : '400')
            .attr('fill', d => vis._isSelected(d) ? d.color : '#64748b')
            .style('cursor', 'pointer')
            .text(d => d.code)
            .on('mouseover', function(event, d) {
                vis._showTooltip(event, d);
            })
            .on('mousemove', function(event) {
                vis._moveTooltip(event);
            })
            .on('mouseleave', function() {
                vis._hideTooltip();
            });
    }

    // ── Click handler ─────────────────────────────────────────────────────────
    _handleClick(event, d) {
        let vis = this;
        const multi = event.metaKey || event.ctrlKey;
        const idx   = vis.selected.findIndex(s => s.year === d.year && s.code === d.code);

        if (!multi) {
            vis.selected = idx >= 0 ? [] : [d];
        } else {
            if (idx >= 0) {
                vis.selected.splice(idx, 1);
            } else {
                if (vis.selected.length >= vis.MAX_SELECT) {
                    vis._showToast(`Maximum ${vis.MAX_SELECT} teams selected`);
                    return;
                }
                vis.selected.push(d);
            }
        }

        vis.updateVis();
        vis._notifyLinked();
    }

    // ── Notify linked visualizations ──────────────────────────────────────────
    _notifyLinked() {
        const sel = this.selected;
        if (typeof championSelectionChanged === 'function') {
            championSelectionChanged(sel);
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────────
    _isSelected(d) {
        return this.selected.some(s => s.year === d.year && s.code === d.code);
    }

    // ── Toast popup ───────────────────────────────────────────────────────────
    _showToast(msg) {
        let toast = document.getElementById('champ-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'champ-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('visible');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
    }

    _showTooltip(event, d) {
        let players = d.versatilePlayers.map(player => `<li>${player}</li>`).join('');

        this.tooltip
            .style('opacity', 1)
            .style('left', event.pageX + 16 + 'px')
            .style('top', event.pageY - 10 + 'px')
            .html(`
            <div>
                <div class="tooltip-year">${d.year} ${d.name}</div>
                <div class="tooltip-label">Versatile players</div>
                <ul>${players}</ul>
            </div>
        `);
    }

    _moveTooltip(event) {
        this.tooltip
            .style('left', event.pageX + 16 + 'px')
            .style('top', event.pageY - 10 + 'px');
    }

    _hideTooltip() {
        this.tooltip
            .style('opacity', 0)
            .html('');
    }

    // ── Public: clear all selections ─────────────────────────────────────────
    clearSelection() {
        this.selected = [];
        this.updateVis();
        this._notifyLinked();
    }
}