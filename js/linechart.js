/*
 * LineChart – ES6 Class
 *
 * Shows the count of run-first vs pass-first teams per NFL season.
 * Reacts to a time-range selection coming from TimelineVis via filterByRange().
 *
 * @param  parentElement  -- id of the HTML container element
 * @param  data           -- full prepared dataset (one row per team-season)
 */

class LineChart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data          = data;

        // Aggregate raw data → one entry per season
        this._allAggregated = this._aggregateByYear(data);
        this.displayData    = this._allAggregated.slice();
    }

    // ─── Aggregate rows → counts per season ──────────────────────────────────
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

        vis.margin = { top: 50, right: 50, bottom: 55, left: 60 };

        let container = document.getElementById(vis.parentElement).getBoundingClientRect();
        vis.width  = container.width  - vis.margin.left - vis.margin.right;
        vis.height = container.height - vis.margin.top  - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width",  container.width)
            .attr("height", container.height)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // ── Clip path ────────────────────────────────────────────────────────
        vis.svg.append("defs").append("clipPath")
            .attr("id", "line-clip")
            .append("rect")
            .attr("width",  vis.width)
            .attr("height", vis.height);

        // ── Scales ───────────────────────────────────────────────────────────
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // ── Axes ─────────────────────────────────────────────────────────────
        vis.xAxis = d3.axisBottom(vis.x)
            .ticks(d3.timeYear.every(1))
            .tickFormat(d3.timeFormat("%Y"));

        vis.yAxis = d3.axisLeft(vis.y)
            .ticks(6)
            .tickSize(-vis.width);

        vis.xAxisG = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0,${vis.height})`);

        vis.yAxisG = vis.svg.append("g")
            .attr("class", "y-axis axis");

        // ── Grid lines style ─────────────────────────────────────────────────
        vis.svg.append("style").text(`
            .y-axis .tick line { stroke: #334155; stroke-dasharray: 3 3; opacity: 0.5; }
            .y-axis .domain, .x-axis .domain { stroke: #475569; }
            .y-axis .tick text, .x-axis .tick text {
                fill: #94a3b8; font-size: 11px; font-family: 'Barlow', sans-serif;
            }
            .x-axis .tick text { transform: rotate(-40deg); text-anchor: end; }
        `);

        // ── Line generators ──────────────────────────────────────────────────
        vis.lineRun = d3.line()
            .defined(d => !isNaN(d.run_first))
            .x(d => vis.x(d.season))
            .y(d => vis.y(d.run_first))
            .curve(d3.curveMonotoneX);

        vis.linePass = d3.line()
            .defined(d => !isNaN(d.pass_first))
            .x(d => vis.x(d.season))
            .y(d => vis.y(d.pass_first))
            .curve(d3.curveMonotoneX);

        // ── Area generators ──────────────────────────────────────────────────
        vis.areaRun = d3.area()
            .defined(d => !isNaN(d.run_first))
            .x(d => vis.x(d.season))
            .y0(vis.height)
            .y1(d => vis.y(d.run_first))
            .curve(d3.curveMonotoneX);

        vis.areaPass = d3.area()
            .defined(d => !isNaN(d.pass_first))
            .x(d => vis.x(d.season))
            .y0(vis.height)
            .y1(d => vis.y(d.pass_first))
            .curve(d3.curveMonotoneX);

        // ── Area fills (rendered behind lines) ───────────────────────────────
        vis.areaRunPath = vis.svg.append("path")
            .attr("class", "area-run")
            .attr("clip-path", "url(#line-clip)")
            .attr("fill", "#f59e0b").attr("opacity", 0.08);

        vis.areaPassPath = vis.svg.append("path")
            .attr("class", "area-pass")
            .attr("clip-path", "url(#line-clip)")
            .attr("fill", "#38bdf8").attr("opacity", 0.08);

        // ── Paths ────────────────────────────────────────────────────────────
        vis.runPath = vis.svg.append("path")
            .attr("class", "line-run")
            .attr("clip-path", "url(#line-clip)")
            .attr("fill", "none")
            .attr("stroke", "#f59e0b")
            .attr("stroke-width", 2.5)
            .attr("stroke-linejoin", "round");

        vis.passPath = vis.svg.append("path")
            .attr("class", "line-pass")
            .attr("clip-path", "url(#line-clip)")
            .attr("fill", "none")
            .attr("stroke", "#38bdf8")
            .attr("stroke-width", 2.5)
            .attr("stroke-linejoin", "round");

        // ── Dot groups ───────────────────────────────────────────────────────
        vis.dotsRunG  = vis.svg.append("g").attr("class", "dots-run");
        vis.dotsPassG = vis.svg.append("g").attr("class", "dots-pass");

        // ── Axis labels ──────────────────────────────────────────────────────
        vis.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", -vis.height / 2).attr("y", -46)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .attr("fill", "#64748b")
            .attr("font-size", "12px")
            .attr("font-family", "'Barlow', sans-serif")
            .text("# of Teams");

        // ── Legend ───────────────────────────────────────────────────────────
        let legend = vis.svg.append("g")
            .attr("transform", `translate(${vis.width - 160}, -36)`);

        // Pass-first
        legend.append("line")
            .attr("x1", 0).attr("y1", 10).attr("x2", 22).attr("y2", 10)
            .attr("stroke", "#38bdf8").attr("stroke-width", 2.5);
        legend.append("circle")
            .attr("cx", 11).attr("cy", 10).attr("r", 4)
            .attr("fill", "#38bdf8");
        legend.append("text")
            .attr("x", 28).attr("y", 14)
            .attr("fill", "#38bdf8").attr("font-size", "12px")
            .attr("font-family", "'Barlow', sans-serif")
            .text("Pass-first");

        // Run-first
        legend.append("line")
            .attr("x1", 100).attr("y1", 10).attr("x2", 122).attr("y2", 10)
            .attr("stroke", "#f59e0b").attr("stroke-width", 2.5);
        legend.append("circle")
            .attr("cx", 111).attr("cy", 10).attr("r", 4)
            .attr("fill", "#f59e0b");
        legend.append("text")
            .attr("x", 128).attr("y", 14)
            .attr("fill", "#f59e0b").attr("font-size", "12px")
            .attr("font-family", "'Barlow', sans-serif")
            .text("Run-first");

        // ── Chart title ──────────────────────────────────────────────────────
        vis.titleText = vis.svg.append("text")
            .attr("class", "chart-title")
            .attr("x", vis.width / 2).attr("y", -24)
            .attr("text-anchor", "middle")
            .attr("fill", "#e2e8f0")
            .attr("font-size", "14px")
            .attr("font-weight", "700")
            .attr("font-family", "'Barlow Condensed', sans-serif")
            .attr("letter-spacing", "0.08em");

        // ── Tooltip ──────────────────────────────────────────────────────────
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "linechart-tooltip")
            .style("position", "absolute")
            .style("background", "rgba(15,23,42,0.92)")
            .style("border", "1px solid #334155")
            .style("border-radius", "6px")
            .style("padding", "8px 12px")
            .style("font-family", "'Barlow', sans-serif")
            .style("font-size", "12px")
            .style("color", "#e2e8f0")
            .style("pointer-events", "none")
            .style("opacity", 0)
            .style("z-index", 999);

        vis.updateVis();
    }

    // ─── Filter by range (called by timeline brushed) ─────────────────────────
    filterByRange([startDate, endDate]) {
        let vis = this;
        vis.displayData = vis._allAggregated.filter(
            d => d.season >= startDate && d.season <= endDate
        );
        vis.updateVis();
    }

    // ─── updateVis ────────────────────────────────────────────────────────────
    updateVis() {
        let vis = this;

        let data = vis.displayData;
        if (!data || data.length === 0) return;

        // Domains
        vis.x.domain(d3.extent(data, d => d.season));
        let maxVal = d3.max(data, d => Math.max(d.run_first, d.pass_first));
        vis.y.domain([0, maxVal + 2]);

        // Title
        let fmt = d3.timeFormat("%Y");
        vis.titleText.text(
            `NFL Team Play Tendencies  ·  ${fmt(data[0].season)} – ${fmt(data[data.length-1].season)}`
        );

        // Transition
        let t = d3.transition().duration(400).ease(d3.easeQuadOut);

        // Areas
        vis.areaRunPath.datum(data).transition(t).attr("d", vis.areaRun);
        vis.areaPassPath.datum(data).transition(t).attr("d", vis.areaPass);

        // Lines
        vis.runPath.datum(data).transition(t).attr("d", vis.lineRun);
        vis.passPath.datum(data).transition(t).attr("d", vis.linePass);

        // Dots – run
        let dotsRun = vis.dotsRunG.selectAll("circle").data(data);
        dotsRun.enter().append("circle")
            .attr("r", 0)
            .merge(dotsRun)
            .on("mouseover", (event, d) => {
                vis.tooltip.transition().duration(150).style("opacity", 1);
                vis.tooltip.html(`
                    <strong>${d3.timeFormat("%Y")(d.season)}</strong><br>
                    <span style="color:#f59e0b">⬤</span> Run-first: <strong>${d.run_first}</strong><br>
                    <span style="color:#38bdf8">⬤</span> Pass-first: <strong>${d.pass_first}</strong>
                `)
                    .style("left", (event.pageX + 12) + "px")
                    .style("top",  (event.pageY - 28) + "px");
            })
            .on("mousemove", event => {
                vis.tooltip
                    .style("left", (event.pageX + 12) + "px")
                    .style("top",  (event.pageY - 28) + "px");
            })
            .on("mouseout", () => vis.tooltip.transition().duration(200).style("opacity", 0))
            .transition(t)
            .attr("cx", d => vis.x(d.season))
            .attr("cy", d => vis.y(d.run_first))
            .attr("r", 5)
            .attr("fill", "#f59e0b")
            .attr("stroke", "#0f172a")
            .attr("stroke-width", 1.5);
        dotsRun.exit().transition(t).attr("r", 0).remove();

        // Dots – pass
        let dotsPass = vis.dotsPassG.selectAll("circle").data(data);
        dotsPass.enter().append("circle")
            .attr("r", 0)
            .merge(dotsPass)
            .on("mouseover", (event, d) => {
                vis.tooltip.transition().duration(150).style("opacity", 1);
                vis.tooltip.html(`
                    <strong>${d3.timeFormat("%Y")(d.season)}</strong><br>
                    <span style="color:#f59e0b">⬤</span> Run-first: <strong>${d.run_first}</strong><br>
                    <span style="color:#38bdf8">⬤</span> Pass-first: <strong>${d.pass_first}</strong>
                `)
                    .style("left", (event.pageX + 12) + "px")
                    .style("top",  (event.pageY - 28) + "px");
            })
            .on("mousemove", event => {
                vis.tooltip
                    .style("left", (event.pageX + 12) + "px")
                    .style("top",  (event.pageY - 28) + "px");
            })
            .on("mouseout", () => vis.tooltip.transition().duration(200).style("opacity", 0))
            .transition(t)
            .attr("cx", d => vis.x(d.season))
            .attr("cy", d => vis.y(d.pass_first))
            .attr("r", 5)
            .attr("fill", "#38bdf8")
            .attr("stroke", "#0f172a")
            .attr("stroke-width", 1.5);
        dotsPass.exit().transition(t).attr("r", 0).remove();

        // Axes
        vis.xAxisG.transition(t).call(vis.xAxis)
            .selectAll("text")
            .style("transform", "rotate(-40deg)")
            .style("text-anchor", "end");

        vis.yAxisG.transition(t).call(vis.yAxis);
    }
}