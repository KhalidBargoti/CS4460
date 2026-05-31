/*
 * FormationVis - ES6 Class
 * @param  svgId            -- id of the <svg> element to draw into
 * @param  labelId          -- id of the formation name <div>
 * @param  descId           -- id of the formation description <div>
 * @param  prosId           -- id of the pros <ul>
 * @param  consId           -- id of the cons <ul>
 * @param  tooltipId        -- id of the tooltip <div>
 * @param  navDotsId        -- id of the nav dots container
 * @param  whistleBtnId     -- id of the whistle button
 * @param  helpBtnId        -- id of the ? button
 * @param  modalOverlayId   -- id of the modal overlay
 * @param  modalCloseId     -- id of the modal close button
 * @param  posListId        -- id of the modal position list container
 */

class FormationVis {

    constructor(svgId, labelId, descId, prosId, consId,
                tooltipId, navDotsId, whistleBtnId,
                helpBtnId, modalOverlayId, modalCloseId, posListId) {

        this.svgId          = svgId;
        this.labelId        = labelId;
        this.descId         = descId;
        this.prosId         = prosId;
        this.consId         = consId;
        this.tooltipId      = tooltipId;
        this.navDotsId      = navDotsId;
        this.whistleBtnId   = whistleBtnId;
        this.helpBtnId      = helpBtnId;
        this.modalOverlayId = modalOverlayId;
        this.modalCloseId   = modalCloseId;
        this.posListId      = posListId;

        this.currentIdx = 0;

        this._defineData();
    }

    // ─── Static data ──────────────────────────────────────────────────────────

    _defineData() {

        this.GLOSSARY = [
            { abbr:'DE',  name:'Defensive End',      desc:'Anchors the edge of the line; primary pass rusher and run stopper on the outside.' },
            { abbr:'DT',  name:'Defensive Tackle',   desc:'Lines up inside the line; clogs run lanes and generates interior pass pressure.' },
            { abbr:'MLB', name:'Middle Linebacker',  desc:'The "QB of the defense"; reads the play and makes gap-fill tackles.' },
            { abbr:'OLB', name:'Outside Linebacker', desc:'Covers edges, can rush the passer or drop into short zone coverage.' },
            { abbr:'CB',  name:'Cornerback',         desc:'Man-covers wide receivers on the perimeter; limits big passing plays.' },
            { abbr:'S',   name:'Safety',             desc:'Last line of defense; plays deep zone (FS) or near the box (SS).' },
            { abbr:'NB',  name:'Nickelback',         desc:'5th DB, usually a slot-coverage specialist in passing situations.' },
            { abbr:'DB',  name:'Dime Back',          desc:'6th DB added on obvious passing downs to maximise coverage.' },
            { abbr:'RS',  name:'Rush (Edge) OLB',    desc:'Pass-rush specialist replacing a LB to generate extra edge pressure.' },
        ];

        // Static offense positions (drawn once, never move)
        this.OFFENSE = [
            { x:255, y:155 }, // LT
            { x:310, y:153 }, // LG
            { x:380, y:152 }, // C
            { x:450, y:153 }, // RG
            { x:505, y:155 }, // RT
            { x:380, y:128 }, // QB
            { x:155, y:145 }, // WR-L far
            { x:205, y:148 }, // WR-L slot
            { x:605, y:145 }, // WR-R far
            { x:555, y:148 }, // WR-R slot
            { x:380, y:108 }, // RB
        ];

        // Four defensive formations; players keyed by id for smooth D3 transitions
        this.FORMATIONS = [
            {
                id: 'base',
                label: 'Neutral / Base 4–3',
                desc: 'The standard starting alignment — four down linemen, three linebackers',
                pros: ['Balanced vs run and pass', 'Predictable assignments reduce mistakes', 'Strong gap control up front'],
                cons: ['Vulnerable to spread / 5-wide sets', 'Only 3 DBs limits pass coverage', 'Quick slants can exploit gaps'],
                players: [
                    { id:'de-l',  abbr:'DE',  x:270, y:188, color:'#38bdf8' },
                    { id:'dt-l',  abbr:'DT',  x:330, y:185, color:'#38bdf8' },
                    { id:'dt-r',  abbr:'DT',  x:430, y:185, color:'#38bdf8' },
                    { id:'de-r',  abbr:'DE',  x:490, y:188, color:'#38bdf8' },
                    { id:'olb-l', abbr:'OLB', x:280, y:222, color:'#a78bfa' },
                    { id:'mlb',   abbr:'MLB', x:380, y:228, color:'#a78bfa' },
                    { id:'olb-r', abbr:'OLB', x:480, y:222, color:'#a78bfa' },
                    { id:'cb-l',  abbr:'CB',  x:170, y:265, color:'#f59e0b' },
                    { id:'s-l',   abbr:'S',   x:310, y:278, color:'#f59e0b' },
                    { id:'s-r',   abbr:'S',   x:450, y:278, color:'#f59e0b' },
                    { id:'cb-r',  abbr:'CB',  x:590, y:265, color:'#f59e0b' },
                ],
                ball: { x:380, y:165 }
            },
            {
                id: 'nickel',
                label: 'Nickel (4–2–5)',
                desc: 'A 5th DB replaces a linebacker — the go-to against 3-wide receiver sets',
                pros: ['Elite slot coverage with nickelback', 'Better pass D vs spread offenses', 'Maintains run-stop with 4 DL'],
                cons: ['Lighter box; RBs can find creases', 'LB depth reduced — screen plays hurt', 'NB can be targeted in run game'],
                players: [
                    { id:'de-l',  abbr:'DE',  x:270, y:188, color:'#38bdf8' },
                    { id:'dt-l',  abbr:'DT',  x:330, y:185, color:'#38bdf8' },
                    { id:'dt-r',  abbr:'DT',  x:430, y:185, color:'#38bdf8' },
                    { id:'de-r',  abbr:'DE',  x:490, y:188, color:'#38bdf8' },
                    { id:'olb-l', abbr:'OLB', x:315, y:222, color:'#a78bfa' },
                    { id:'olb-r', abbr:'OLB', x:445, y:222, color:'#a78bfa' },
                    { id:'cb-l',  abbr:'CB',  x:155, y:260, color:'#f59e0b' },
                    { id:'nb',    abbr:'NB',  x:270, y:272, color:'#4ade80' },
                    { id:'s-l',   abbr:'S',   x:358, y:285, color:'#f59e0b' },
                    { id:'s-r',   abbr:'S',   x:452, y:285, color:'#f59e0b' },
                    { id:'cb-r',  abbr:'CB',  x:590, y:260, color:'#f59e0b' },
                ],
                ball: { x:380, y:165 }
            },
            {
                id: 'rush',
                label: 'Rush / Bear Front',
                desc: 'Extra pass rushers loaded at the line — designed to collapse the pocket fast',
                pros: ['Maximum pass-rush pressure', 'Disrupts timing routes & rollouts', 'Forces quick-throw errors'],
                cons: ['Highly vulnerable to the run', 'Leaves CBs on islands in man', 'Easy to exploit with screens & draws'],
                players: [
                    { id:'rs-l',  abbr:'RS',  x:222, y:185, color:'#f87171' },
                    { id:'de-l',  abbr:'DE',  x:285, y:183, color:'#38bdf8' },
                    { id:'dt-l',  abbr:'DT',  x:340, y:181, color:'#38bdf8' },
                    { id:'dt-r',  abbr:'DT',  x:420, y:181, color:'#38bdf8' },
                    { id:'de-r',  abbr:'DE',  x:475, y:183, color:'#38bdf8' },
                    { id:'rs-r',  abbr:'RS',  x:538, y:185, color:'#f87171' },
                    { id:'mlb',   abbr:'MLB', x:380, y:228, color:'#a78bfa' },
                    { id:'cb-l',  abbr:'CB',  x:148, y:262, color:'#f59e0b' },
                    { id:'s-l',   abbr:'S',   x:300, y:280, color:'#f59e0b' },
                    { id:'s-r',   abbr:'S',   x:460, y:280, color:'#f59e0b' },
                    { id:'cb-r',  abbr:'CB',  x:608, y:262, color:'#f59e0b' },
                ],
                ball: { x:380, y:165 }
            },
            {
                id: 'dime',
                label: 'Dime (4–1–6)',
                desc: 'Six defensive backs — used on obvious passing downs (3rd & long)',
                pros: ['Best possible pass coverage', 'Covers all 5 routes simultaneously', 'Can disguise zone/man presnap'],
                cons: ['Nearly defenseless vs the run', 'One LB cannot fill multiple gaps', 'Susceptible to play-action fakes'],
                players: [
                    { id:'de-l',  abbr:'DE',  x:270, y:188, color:'#38bdf8' },
                    { id:'dt-l',  abbr:'DT',  x:330, y:185, color:'#38bdf8' },
                    { id:'dt-r',  abbr:'DT',  x:430, y:185, color:'#38bdf8' },
                    { id:'de-r',  abbr:'DE',  x:490, y:188, color:'#38bdf8' },
                    { id:'mlb',   abbr:'MLB', x:380, y:222, color:'#a78bfa' },
                    { id:'cb-l',  abbr:'CB',  x:130, y:255, color:'#f59e0b' },
                    { id:'nb',    abbr:'NB',  x:240, y:268, color:'#4ade80' },
                    { id:'s-l',   abbr:'S',   x:335, y:285, color:'#f59e0b' },
                    { id:'s-r',   abbr:'S',   x:425, y:285, color:'#f59e0b' },
                    { id:'db',    abbr:'DB',  x:520, y:268, color:'#4ade80' },
                    { id:'cb-r',  abbr:'CB',  x:628, y:255, color:'#f59e0b' },
                ],
                ball: { x:380, y:165 }
            }
        ];
    }

    // ─── initVis ──────────────────────────────────────────────────────────────

    initVis() {
        let vis = this;

        vis.svg      = d3.select('#' + vis.svgId);
        vis.tooltip  = document.getElementById(vis.tooltipId);
        vis.FW       = 760;
        vis.FH       = 340;

        vis._drawField();
        vis._drawOffense();

        // Ball layer (above offense, below defense)
        vis.ballG    = vis.svg.append('g').attr('class', 'ball-layer');
        // Defense layer
        vis.playersG = vis.svg.append('g').attr('class', 'defense-layer');

        vis._buildNavDots();
        vis._buildModal();
        vis._bindControls();

        vis.wrangleData();
    }

    // ─── wrangleData ──────────────────────────────────────────────────────────

    wrangleData() {
        // No filtering needed — just render current formation
        this.updateVis(false);
    }

    // ─── updateVis ────────────────────────────────────────────────────────────

    updateVis(animate) {
        let vis = this;
        const f = vis.FORMATIONS[vis.currentIdx];

        // ── Players (D3 enter/update/exit) ──────────────────────────────────
        const players = vis.playersG.selectAll('.player-g')
            .data(f.players, d => d.id);

        // ENTER
        const enterSel = players.enter()
            .append('g')
            .attr('class', 'player-g')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('opacity', 0)
            .style('cursor', 'pointer');

        enterSel.append('circle')
            .attr('r', 13)
            .attr('fill',   d => d.color + '22')
            .attr('stroke', d => d.color)
            .attr('stroke-width', 1.8);

        enterSel.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '9px')
            .attr('font-weight', '700')
            .attr('fill', d => d.color)
            .text(d => d.abbr);

        // Tooltip on enter + existing
        const merged = enterSel.merge(players);

        merged
            .on('mousemove', (event, d) => vis._showTooltip(event, d))
            .on('mouseleave', () => vis._hideTooltip());

        // Animate enter nodes in
        enterSel.transition().duration(animate ? 500 : 0)
            .attr('opacity', 1);

        // UPDATE — move existing nodes
        players.transition().duration(animate ? 600 : 0)
            .ease(d3.easeCubicInOut)
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('opacity', 1);

        // Update colours on existing nodes separately (can't chain select after transition)
        players.select('circle')
            .transition().duration(animate ? 600 : 0)
            .attr('stroke', d => d.color)
            .attr('fill',   d => d.color + '22');

        players.select('text')
            .transition().duration(animate ? 600 : 0)
            .attr('fill', d => d.color);

        // EXIT
        players.exit()
            .transition().duration(animate ? 280 : 0)
            .attr('opacity', 0)
            .remove();

        // ── Ball ────────────────────────────────────────────────────────────
        vis._drawBall(f.ball.x, f.ball.y, animate);

        // ── Labels ──────────────────────────────────────────────────────────
        document.getElementById(vis.labelId).textContent = f.label;
        document.getElementById(vis.descId).textContent  = f.desc;

        // ── Pros / Cons ──────────────────────────────────────────────────────
        document.getElementById(vis.prosId).innerHTML =
            f.pros.map(p => `<li>${p}</li>`).join('');
        document.getElementById(vis.consId).innerHTML =
            f.cons.map(c => `<li>${c}</li>`).join('');

        // ── Nav dots ─────────────────────────────────────────────────────────
        document.querySelectorAll('.nav-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === vis.currentIdx);
        });
    }

    // ─── Draw static field ────────────────────────────────────────────────────

    _drawField() {
        let vis = this;
        const s = vis.svg;

        // Field fill
        s.append('rect')
            .attr('width', vis.FW).attr('height', vis.FH)
            .attr('rx', 8)
            .attr('fill', '#0d1f12');

        // Invisible coordinate grid
        const cols = 12, rows = 8;
        const gridG = s.append('g').attr('class', 'grid');

        for (let c = 1; c < cols; c++) {
            gridG.append('line')
                .attr('x1', c * vis.FW / cols).attr('y1', 0)
                .attr('x2', c * vis.FW / cols).attr('y2', vis.FH)
                .attr('stroke', 'rgba(255,255,255,0.03)').attr('stroke-width', 1);
        }
        for (let r = 1; r < rows; r++) {
            gridG.append('line')
                .attr('x1', 0).attr('y1', r * vis.FH / rows)
                .attr('x2', vis.FW).attr('y2', r * vis.FH / rows)
                .attr('stroke', 'rgba(255,255,255,0.03)').attr('stroke-width', 1);
        }

        // Hash marks
        for (let i = 0; i < 11; i++) {
            const hx = 80 + i * 60;
            s.append('line')
                .attr('x1', hx).attr('y1', vis.FH / 2 - 5)
                .attr('x2', hx).attr('y2', vis.FH / 2 + 5)
                .attr('stroke', 'rgba(255,255,255,0.06)').attr('stroke-width', 1);
        }

        // Line of scrimmage
        s.append('line')
            .attr('x1', 60).attr('y1', 170)
            .attr('x2', vis.FW - 60).attr('y2', 170)
            .attr('stroke', 'rgba(245,158,11,0.35)').attr('stroke-width', 1.4)
            .attr('stroke-dasharray', '6,4');

        s.append('text')
            .attr('x', 64).attr('y', 164)
            .attr('fill', 'rgba(245,158,11,0.38)')
            .attr('font-size', '9px')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('letter-spacing', '.12em')
            .text('LINE OF SCRIMMAGE');

        // Side labels
        [{ label:'OFFENSE', y:80,  color:'rgba(56,189,248,0.15)' },
            { label:'DEFENSE', y:220, color:'rgba(167,139,250,0.15)' }
        ].forEach(({ label, y, color }) => {
            s.append('text')
                .attr('x', 22).attr('y', y)
                .attr('fill', color)
                .attr('font-size', '9px')
                .attr('font-family', 'Barlow Condensed, sans-serif')
                .attr('writing-mode', 'tb')
                .attr('letter-spacing', '.2em')
                .text(label);
        });
    }

    // ─── Draw static offense icons ────────────────────────────────────────────

    _drawOffense() {
        let vis = this;
        const g = vis.svg.append('g').attr('class', 'offense-group');
        vis.OFFENSE.forEach(p => {
            g.append('circle')
                .attr('cx', p.x).attr('cy', p.y)
                .attr('r', 9)
                .attr('fill', 'none')
                .attr('stroke', 'rgba(56,189,248,0.22)')
                .attr('stroke-width', 1.4);
        });
    }

    // ─── Draw / update the football ───────────────────────────────────────────

    _drawBall(bx, by, animate) {
        let vis = this;
        vis.ballG.selectAll('*').remove();

        const dur  = animate ? 600 : 0;
        const del  = animate ? 120 : 0;

        const items = [
            // body ellipse
            () => vis.ballG.append('ellipse')
                .attr('cx', bx).attr('cy', by)
                .attr('rx', 6).attr('ry', 11)
                .attr('fill', 'none')
                .attr('stroke', '#fb923c').attr('stroke-width', 1.6),
            // centre seam
            () => vis.ballG.append('line')
                .attr('x1', bx - 6).attr('y1', by)
                .attr('x2', bx + 6).attr('y2', by)
                .attr('stroke', '#fb923c').attr('stroke-width', 1.2),
        ];

        // laces
        [-3, 0, 3].forEach(dy => {
            items.push(() => vis.ballG.append('line')
                .attr('x1', bx - 3).attr('y1', by + dy)
                .attr('x2', bx + 3).attr('y2', by + dy)
                .attr('stroke', '#fb923c').attr('stroke-width', 1.1)
                .attr('stroke-linecap', 'round'));
        });

        items.forEach(fn => {
            fn().attr('opacity', animate ? 0 : 1)
                .transition().duration(dur).delay(del)
                .attr('opacity', 1);
        });
    }

    // ─── Tooltip ──────────────────────────────────────────────────────────────

    _showTooltip(event, d) {
        let vis = this;
        const entry = vis.GLOSSARY.find(p => p.abbr === d.abbr);
        if (!entry) return;
        vis.tooltip.innerHTML =
            `<strong>${entry.abbr} — ${entry.name}</strong>${entry.desc}`;
        vis.tooltip.style.opacity = 1;
        vis.tooltip.style.left = (event.clientX + 14) + 'px';
        vis.tooltip.style.top  = (event.clientY - 10) + 'px';
    }

    _hideTooltip() {
        this.tooltip.style.opacity = 0;
    }

    // ─── Nav dots ─────────────────────────────────────────────────────────────

    _buildNavDots() {
        let vis = this;
        const container = document.getElementById(vis.navDotsId);
        container.innerHTML = '';
        vis.FORMATIONS.forEach((f, i) => {
            const dot = document.createElement('div');
            dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
            dot.title = f.label;
            dot.addEventListener('click', () => {
                vis.currentIdx = i;
                vis.updateVis(true);
            });
            container.appendChild(dot);
        });
    }

    // ─── Position guide modal ─────────────────────────────────────────────────

    _buildModal() {
        let vis = this;
        const list = document.getElementById(vis.posListId);
        list.innerHTML = vis.GLOSSARY.map(p => `
            <div class="pos-entry">
                <div class="pos-abbr">${p.abbr}</div>
                <div class="pos-info">
                    <strong>${p.name}</strong>
                    <span>${p.desc}</span>
                </div>
            </div>`).join('');
    }

    // ─── Button / modal event bindings ────────────────────────────────────────

    _bindControls() {
        let vis = this;

        // Whistle — advance formation
        document.getElementById(vis.whistleBtnId).addEventListener('click', () => {
            const btn = document.getElementById(vis.whistleBtnId);
            btn.style.transform = 'scale(0.82)';
            setTimeout(() => btn.style.transform = '', 140);
            vis.currentIdx = (vis.currentIdx + 1) % vis.FORMATIONS.length;
            vis.updateVis(true);
        });

        // Help modal open / close
        const overlay = document.getElementById(vis.modalOverlayId);
        document.getElementById(vis.helpBtnId).addEventListener('click', () =>
            overlay.classList.add('open'));
        document.getElementById(vis.modalCloseId).addEventListener('click', () =>
            overlay.classList.remove('open'));
        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    }
}