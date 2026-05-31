/*
 * TimelineVis – vertical year-range selector
 *
 * Two draggable SVG handles live on a vertical time axis:
 *   • Top handle  → a football helmet  (start year, can never pass the football)
 *   • Bottom handle → a football       (end year,  can never pass the helmet)
 *
 * Dragging either handle calls the global brushed([start, end]) function
 * which the line chart reacts to.
 */

class TimelineVis {

    constructor(parentElement, data) {
        this._parentElement = parentElement;
        this._data          = data;

        // Aggregate: one row per season
        this._yearData = this._aggregateByYear(data);

        // Default selection: full range
        this._years = this._yearData.map(d => d.season);
        this._startYear = this._years[0];
        this._endYear   = this._years[this._years.length - 1];
    }

    // ─── Aggregate raw rows → one entry per season ───────────────────────────
    _aggregateByYear(data) {
        let rollup = d3.rollups(
            data,
            v => ({
                run_first:  v.filter(d => d.run_first_label === "run_first").length,
                pass_first: v.filter(d => d.run_first_label === "pass_first").length,
                total:      v.length
            }),
            d => d.season
        );
        return rollup
            .map(([season, vals]) => ({ season, ...vals }))
            .sort((a, b) => a.season - b.season);
    }

    // ─── initVis ──────────────────────────────────────────────────────────────
    initVis() {
        let vis = this;

        vis.margin = { top: 18, right: 110, bottom: 18, left: 60 };

        let container = document.getElementById(vis._parentElement).getBoundingClientRect();
        vis.width  = container.width  - vis.margin.left - vis.margin.right;
        vis.height = container.height - vis.margin.top  - vis.margin.bottom;

        vis.svg = d3.select("#" + vis._parentElement).append("svg")
            .attr("width",  container.width)
            .attr("height", container.height)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // ── Vertical time scale ──────────────────────────────────────────────
        vis.y = d3.scaleTime()
            .domain(d3.extent(vis._yearData, d => d.season))
            .range([0, vis.height]);

        // Discrete year positions for snapping
        vis._snapPositions = vis._yearData.map(d => ({
            year: d.season,
            py:   vis.y(d.season)
        }));

        // ── Axis ─────────────────────────────────────────────────────────────
        let yAxis = d3.axisRight(vis.y)
            .ticks(d3.timeYear.every(1))
            .tickFormat(d3.timeFormat("%Y"))
            .tickSize(6);

        vis.svg.append("g")
            .attr("class", "y-axis axis timeline-axis")
            .attr("transform", `translate(${vis.width / 2 + 18}, 0)`)
            .call(yAxis);

        // ── Track line ───────────────────────────────────────────────────────
        vis.trackX = vis.width / 2;

        // Background track
        vis.svg.append("line")
            .attr("class", "track-bg")
            .attr("x1", vis.trackX).attr("x2", vis.trackX)
            .attr("y1", 0).attr("y2", vis.height)
            .attr("stroke", "#334155").attr("stroke-width", 4)
            .attr("stroke-linecap", "round");

        // Active selection segment (between handles)
        vis.trackActive = vis.svg.append("line")
            .attr("class", "track-active")
            .attr("x1", vis.trackX).attr("x2", vis.trackX)
            .attr("stroke", "#f59e0b").attr("stroke-width", 4)
            .attr("stroke-linecap", "round");

        // ── Label (left side of track) ───────────────────────────────────────
        vis.labelStart = vis.svg.append("text")
            .attr("class", "handle-label")
            .attr("x", vis.trackX - 24).attr("text-anchor", "end")
            .attr("dy", "0.35em")
            .attr("fill", "#7dd3fc").attr("font-size", "11px").attr("font-weight", "700");

        vis.labelEnd = vis.svg.append("text")
            .attr("class", "handle-label")
            .attr("x", vis.trackX - 24).attr("text-anchor", "end")
            .attr("dy", "0.35em")
            .attr("fill", "#fb923c").attr("font-size", "11px").attr("font-weight", "700");

        // ── Handles ──────────────────────────────────────────────────────────
        // --- Helmet (start / top) ---
        vis.helmetG = vis.svg.append("g").attr("class", "handle helmet-handle");
        vis._buildHelmet(vis.helmetG);

        // --- Football (end / bottom) ---
        vis.footballG = vis.svg.append("g").attr("class", "handle football-handle");
        vis._buildFootball(vis.footballG);

        // ── Drag behaviours ──────────────────────────────────────────────────
        let dragHelmet = d3.drag()
            .on("drag", function(event) {
                let newY  = Math.max(0, Math.min(vis.y(vis._endYear) - 1, event.y));
                let snapped = vis._snap(newY);
                vis._startYear = snapped.year;
                vis._updateHandles();
                brushed([vis._startYear, vis._endYear]);
            });

        let dragFootball = d3.drag()
            .on("drag", function(event) {
                let newY  = Math.max(vis.y(vis._startYear) + 1, Math.min(vis.height, event.y));
                let snapped = vis._snap(newY);
                vis._endYear = snapped.year;
                vis._updateHandles();
                brushed([vis._startYear, vis._endYear]);
            });

        vis.helmetG.call(dragHelmet).style("cursor", "grab");
        vis.footballG.call(dragFootball).style("cursor", "grab");

        vis._updateHandles();
    }

    // ─── Snap a raw pixel position to the nearest year ───────────────────────
    _snap(py) {
        return this._snapPositions.reduce((best, d) =>
            Math.abs(d.py - py) < Math.abs(best.py - py) ? d : best
        );
    }

    // ─── Re-position both handles & labels ───────────────────────────────────
    _updateHandles() {
        let vis = this;
        let sy = vis.y(vis._startYear);
        let ey = vis.y(vis._endYear);

        vis.helmetG.attr("transform", `translate(${vis.trackX}, ${sy})`);
        vis.footballG.attr("transform", `translate(${vis.trackX}, ${ey})`);

        vis.trackActive
            .attr("y1", sy).attr("y2", ey);

        vis.labelStart
            .attr("y", sy)
            .text(d3.timeFormat("%Y")(vis._startYear));

        vis.labelEnd
            .attr("y", ey)
            .text(d3.timeFormat("%Y")(vis._endYear));
    }

    // ─── SVG: minimalist football helmet (facing right) ──────────────────────
    _buildHelmet(g) {
        // Shell
        g.append("path")
            .attr("d", `
                M -18,0
                C -18,-14 -4,-20 8,-18
                C 18,-15 22,-8 22,0
                C 22,8 16,14 8,16
                L -12,16
                C -16,16 -18,12 -18,8
                Z
            `)
            .attr("fill", "none")
            .attr("stroke", "#7dd3fc")
            .attr("stroke-width", 2.2)
            .attr("stroke-linejoin", "round");

        // Facemask bar
        g.append("path")
            .attr("d", `M 8,6 C 14,4 20,2 22,0`)
            .attr("fill", "none")
            .attr("stroke", "#7dd3fc")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round");

        // Chinstrap
        g.append("path")
            .attr("d", `M -12,16 C -10,22 0,24 8,22 C 16,20 22,14 22,8`)
            .attr("fill", "none")
            .attr("stroke", "#7dd3fc")
            .attr("stroke-width", 1.5)
            .attr("stroke-linecap", "round")
            .attr("stroke-dasharray", "3,2");

        // Hit zone / drag target
        g.append("circle")
            .attr("r", 22)
            .attr("fill", "transparent");
    }

    // ─── SVG: minimalist football (vertical orientation) ─────────────────────
    _buildFootball(g) {
        // Body
        g.append("ellipse")
            .attr("rx", 9).attr("ry", 18)
            .attr("fill", "none")
            .attr("stroke", "#fb923c")
            .attr("stroke-width", 2.2);

        // Center seam (horizontal)
        g.append("line")
            .attr("x1", -9).attr("y1", 0)
            .attr("x2",  9).attr("y2", 0)
            .attr("stroke", "#fb923c").attr("stroke-width", 1.4);

        // Laces
        [-4, 0, 4].forEach(yOff => {
            g.append("line")
                .attr("x1", -4).attr("y1", yOff)
                .attr("x2",  4).attr("y2", yOff)
                .attr("stroke", "#fb923c").attr("stroke-width", 1.3)
                .attr("stroke-linecap", "round");
        });

        // Hit zone / drag target
        g.append("circle")
            .attr("r", 22)
            .attr("fill", "transparent");
    }
}