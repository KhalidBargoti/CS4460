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
                tooltipId, navDotsId, whistleBtnId, backBtnId,
                helpBtnId, modalOverlayId, modalCloseId, posListId) {

        this.svgId          = svgId;
        this.labelId        = labelId;
        this.descId         = descId;
        this.prosId         = prosId;
        this.consId         = consId;
        this.tooltipId      = tooltipId;
        this.navDotsId      = navDotsId;
        this.whistleBtnId   = whistleBtnId;
        this.backBtnId      = backBtnId;
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


        // Four defensive formations; players keyed by id for smooth D3 transitions
        this.FORMATIONS = [
            {
                id: 'base',
                label: 'Neutral / Base 4–3',
                desc: 'The standard starting alignment — four down linemen, three linebackers',
                overview: [
                    "Traditional balanced defense with more linebackers on the field.",
                    "Stronger against the run and heavier offensive personnel.",
                    "Can struggle against spread passing looks because linebackers may have to cover faster receivers."
                ],
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
                overview: [
                    "Modern balanced defense against three-receiver offenses.",
                    "Adds an extra defensive back while still keeping enough size against the run.",
                    "Works well against 11 personnel because it can handle both slot receivers and normal run threats."
                ],
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
                overview: [
                    "Designed to create quick pressure and collapse the pocket.",
                    "Loads defenders near the line of scrimmage to attack the quarterback or stop inside runs.",
                    "Can be risky if the offense gets the ball out quickly or attacks the open space behind the pressure."
                ],
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
                overview: [
                    "Best in obvious passing situations.",
                    "Uses extra defensive backs to cover spread formations.",
                    "Weak against heavy run personnel because there are fewer box defenders."
                ],
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

        // Offensive personnel groups
        this.OFFENSES = [
            {
                id: "10",
                label: "10 Personnel",
                desc: "1 RB, 0 TE, 4 WR",

                overview: [
                    "Spreads the field with four wide receivers.",
                    "Strong for quick passing and spacing concepts.",
                    "Can struggle in the run game because there are no tight ends."
                ],

                players: [
                    // Offensive line
                    { id:'lt', abbr:'LT', x:300, y:155, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'lg', abbr:'LG', x:340, y:153, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'c',  abbr:'C',  x:380, y:152, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'rg', abbr:'RG', x:420, y:153, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'rt', abbr:'RT', x:460, y:155, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },

                    // Backfield
                    { id:'qb', abbr:'QB', x:380, y:128, fill:'#7c2d12', stroke:'#fb923c', textColor:'#fed7aa' },
                    { id:'hb', abbr:'HB', x:380, y:88, fill:'#14532d', stroke:'#22c55e', textColor:'#dcfce7' },

                    // Receivers
                    { id:'wr-l',  abbr:'WR', x:115, y:142, fill:'#1e1b4b', stroke:'#818cf8', textColor:'#e0e7ff' },
                    { id:'wr-sl', abbr:'WR', x:210, y:142, fill:'#1e1b4b', stroke:'#818cf8', textColor:'#e0e7ff' },
                    { id:'wr-sr', abbr:'WR', x:550, y:142, fill:'#1e1b4b', stroke:'#818cf8', textColor:'#e0e7ff' },
                    { id:'wr-r',  abbr:'WR', x:645, y:142, fill:'#1e1b4b', stroke:'#818cf8', textColor:'#e0e7ff' }
                ]
            },
            {
                id: "11",
                label: "11 Personnel",
                desc: "1 RB, 1 TE, 3 WR",

                overview: [
                    "Balanced personnel group for both run and pass.",
                    "Three receivers spread the defense horizontally.",
                    "The tight end gives flexibility as a blocker or receiver."
                ],

                players: [
                    // Offensive line
                    { id:'lt', abbr:'LT', x:300, y:155, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'lg', abbr:'LG', x:340, y:153, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'c',  abbr:'C',  x:380, y:152, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'rg', abbr:'RG', x:420, y:153, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'rt', abbr:'RT', x:460, y:155, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },

                    // Backfield
                    { id:'qb', abbr:'QB', x:380, y:128, fill:'#7c2d12', stroke:'#fb923c', textColor:'#fed7aa' },
                    { id:'hb', abbr:'HB', x:380, y:88, fill:'#14532d', stroke:'#22c55e', textColor:'#dcfce7' },

                    // TE / WR
                    { id:'te', abbr:'TE', x:505, y:152, fill:'#3f3f0f', stroke:'#a3e635', textColor:'#ecfccb' },
                    { id:'wr-l', abbr:'WR', x:120, y:142, fill:'#1e1b4b', stroke:'#818cf8', textColor:'#e0e7ff' },
                    { id:'wr-s', abbr:'WR', x:220, y:142, fill:'#1e1b4b', stroke:'#818cf8', textColor:'#e0e7ff' },
                    { id:'wr-r', abbr:'WR', x:635, y:142, fill:'#1e1b4b', stroke:'#818cf8', textColor:'#e0e7ff' }
                ]

            },
            {
                id: "12",
                label: "12 Personnel",
                desc: "1 RB, 2 TE, 2 WR",

                overview: [
                    "Heavier grouping with two tight ends.",
                    "Strong for running the ball and using play action.",
                    "Can force lighter defenses into bad run fits."
                ],

                players: [
                    // Offensive line
                    { id:'lt', abbr:'LT', x:300, y:155, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'lg', abbr:'LG', x:340, y:153, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'c',  abbr:'C',  x:380, y:152, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'rg', abbr:'RG', x:420, y:153, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'rt', abbr:'RT', x:460, y:155, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },

                    // Backfield
                    { id:'qb', abbr:'QB', x:380, y:128, fill:'#7c2d12', stroke:'#fb923c', textColor:'#fed7aa' },
                    { id:'hb', abbr:'HB', x:380, y:88, fill:'#14532d', stroke:'#22c55e', textColor:'#dcfce7' },

                    // TEs / WRs
                    { id:'te-l', abbr:'TE', x:255, y:152, fill:'#3f3f0f', stroke:'#a3e635', textColor:'#ecfccb' },
                    { id:'te-r', abbr:'TE', x:505, y:152, fill:'#3f3f0f', stroke:'#a3e635', textColor:'#ecfccb' },
                    { id:'wr-l', abbr:'WR', x:110, y:142, fill:'#1e1b4b', stroke:'#818cf8', textColor:'#e0e7ff' },
                    { id:'wr-r', abbr:'WR', x:650, y:142, fill:'#1e1b4b', stroke:'#818cf8', textColor:'#e0e7ff' }
                ]
            },
            {
                id: "21",
                label: "21 Personnel",
                desc: "2 RB, 1 TE, 2 WR",

                overview: [
                    "Two-back grouping that supports downhill run concepts.",
                    "Good for lead blocking and short-yardage situations.",
                    "Can still pass using the fullback or tight end as outlets."
                ],

                players: [
                    // Offensive line
                    { id:'lt', abbr:'LT', x:300, y:155, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'lg', abbr:'LG', x:340, y:153, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'c',  abbr:'C',  x:380, y:152, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'rg', abbr:'RG', x:420, y:153, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },
                    { id:'rt', abbr:'RT', x:460, y:155, fill:'#0c4a6e', stroke:'#38bdf8', textColor:'#e0f2fe' },

                    // Backfield
                    { id:'qb', abbr:'QB', x:380, y:128, fill:'#7c2d12', stroke:'#fb923c', textColor:'#fed7aa' },
                    { id:'hb', abbr:'HB', x:380, y:88, fill:'#14532d', stroke:'#22c55e', textColor:'#dcfce7' },
                    { id:'fb', abbr:'FB', x:380, y:110, fill:'#14532d', stroke:'#22c55e', textColor:'#dcfce7' },

                    // TE / WR
                    { id:'te', abbr:'TE', x:505, y:152, fill:'#3f3f0f', stroke:'#a3e635', textColor:'#ecfccb' },
                    { id:'wr-l', abbr:'WR', x:115, y:142, fill:'#1e1b4b', stroke:'#818cf8', textColor:'#e0e7ff' },
                    { id:'wr-r', abbr:'WR', x:645, y:142, fill:'#1e1b4b', stroke:'#818cf8', textColor:'#e0e7ff' }
                ]
            }
        ];

// Matchup explanations: offense-defense
        this.MATCHUPS = {
            "12-dime": {
                advantage: "Overwhelmingly Offense",
                explanation: "12 personnel gives the offense a strong run-game advantage against dime. The offense has two tight ends for heavier blocking, while dime uses extra defensive backs and fewer big run defenders."
            },

            "21-dime": {
                advantage: "Overwhelmingly Offense",
                explanation: "21 personnel can punish dime because the offense has two backs and a tight end, creating a heavy run threat against a lighter defensive package."
            },

            "10-base": {
                advantage: "Offense",
                explanation: "10 personnel spreads the field with four wide receivers. Base defense can struggle because linebackers may be forced into coverage against faster receivers."
            },

            "11-nickel": {
                advantage: "Balanced",
                explanation: "Nickel is built to handle 11 personnel. The defense has enough defensive backs for three receivers while keeping enough size against the run."
            },

            "10-dime": {
                advantage: "Balanced",
                explanation: "Dime matches up well against spread passing looks because it adds extra defensive backs, but the offense can still create space underneath."
            },

            "12-base": {
                advantage: "Balanced",
                explanation: "Base defense has enough size to handle the run threat from 12 personnel, but the offense can still stress it with play action and tight end routes."
            },

            "21-base": {
                advantage: "Balanced",
                explanation: "Base defense is designed to handle heavier offensive personnel, so this matchup is fairly even. The offense can run downhill, but the defense has enough size in the box."
            },

            "10-rush": {
                advantage: "Defense",
                explanation: "Rush packages are designed to pressure the quarterback. Against 10 personnel, the defense can attack empty or spread looks quickly, but it risks leaving space underneath."
            }
        };

        // Reorder formations for display
        const formationOrder = ['dime', 'nickel', 'base', 'rush'];

        this.FORMATIONS.sort((a, b) => {
            return formationOrder.indexOf(a.id) - formationOrder.indexOf(b.id);
        });

        this.currentOffenseIdx = 1; // starts at 11 personnel
    }

    // ─── initVis ──────────────────────────────────────────────────────────────

    initVis() {
        let vis = this;

        vis.svg      = d3.select('#' + vis.svgId);
        vis.tooltip  = document.getElementById(vis.tooltipId);
        vis.FW       = 760;
        vis.FH       = 340;

        vis._drawField();

// Offense layer
        vis.offenseG = vis.svg.append('g').attr('class', 'offense-layer');

// Ball layer above offense, below defense
        vis.ballG = vis.svg.append('g').attr('class', 'ball-layer');
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

        vis._updateOffensePlayers(animate);

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

        // ── Nav dots ─────────────────────────────────────────────────────────
        document.querySelectorAll('.nav-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === vis.currentIdx);
        });

        vis._updateOffenseDisplay();
        vis._updateDefenseDisplay();
        vis._updateMatchupText();
        vis._updateOverviewBoxes();
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

    // ─── Draw / update offense icons ────────────────────────────────────────────

    _updateOffensePlayers(animate) {
        let vis = this;

        const offense = vis.OFFENSES[vis.currentOffenseIdx];

        const players = vis.offenseG.selectAll('.offense-player-g')
            .data(offense.players, d => d.id);

        const enterSel = players.enter()
            .append('g')
            .attr('class', 'offense-player-g')
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('opacity', 0)
            .style('cursor', 'pointer');

        enterSel.append('circle')
            .attr('r', 13)
            .attr('fill', d => d.fill)
            .attr('stroke', d => d.stroke)
            .attr('stroke-width', 2);

        enterSel.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-family', 'Barlow Condensed, sans-serif')
            .attr('font-size', '10px')
            .attr('font-weight', '700')
            .attr('fill', d => d.textColor)
            .text(d => d.abbr);

        const merged = enterSel.merge(players);

        merged
            .on('mousemove', (event, d) => vis._showOffenseTooltip(event, d))
            .on('mouseleave', () => vis._hideTooltip());

        enterSel.transition().duration(animate ? 500 : 0)
            .attr('opacity', 1);

        players.transition().duration(animate ? 600 : 0)
            .ease(d3.easeCubicInOut)
            .attr('transform', d => `translate(${d.x},${d.y})`)
            .attr('opacity', 1);

        players.select('circle')
            .transition().duration(animate ? 600 : 0)
            .attr('stroke', d => d.stroke)
            .attr('fill', d => d.fill);

        players.select('text')
            .transition().duration(animate ? 600 : 0)
            .attr('fill', d => d.textColor)
            .text(d => d.abbr);

        players.exit()
            .transition().duration(animate ? 280 : 0)
            .attr('opacity', 0)
            .remove();
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

    _showOffenseTooltip(event, d) {
        let vis = this;

        const names = {
            QB: "Quarterback",
            RB: "Running Back",
            HB: "Halfback",
            FB: "Fullback",
            WR: "Wide Receiver",
            TE: "Tight End",
            LT: "Left Tackle",
            LG: "Left Guard",
            C: "Center",
            RG: "Right Guard",
            RT: "Right Tackle"
        };

        const descriptions = {
            QB: "Controls the play, receives the snap, and decides whether to hand off, pass, or scramble.",
            RB: "Primary ball carrier in the run game and can also block or catch passes.",
            HB: "Main running back aligned behind or beside the quarterback.",
            FB: "Lead blocker or short-yardage back used in heavier personnel.",
            WR: "Receiver aligned wide or in the slot to stretch the defense.",
            TE: "Hybrid blocker and receiver; important in both run and pass concepts.",
            LT: "Protects the quarterback's blind side and blocks edge rushers.",
            LG: "Interior offensive lineman responsible for run blocking and pass protection.",
            C: "Snaps the ball and anchors the middle of the offensive line.",
            RG: "Interior offensive lineman responsible for run blocking and pass protection.",
            RT: "Blocks edge rushers and supports outside run concepts."
        };

        const name = names[d.abbr] || d.abbr;
        const desc = descriptions[d.abbr] || "Offensive player.";

        vis.tooltip.innerHTML =
            `<strong>${d.abbr} — ${name}</strong>${desc}`;

        vis.tooltip.style.opacity = 1;
        vis.tooltip.style.left = (event.clientX + 14) + 'px';
        vis.tooltip.style.top  = (event.clientY - 10) + 'px';
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

    _updateOffenseDisplay() {
        let vis = this;

        const offense = vis.OFFENSES[vis.currentOffenseIdx];

        const label = document.getElementById("offense-label");
        const desc = document.getElementById("offense-desc");

        if (label) {
            label.textContent = offense.label;
        }

        if (desc) {
            desc.textContent = offense.desc;
        }
    }

    _updateDefenseDisplay() {
        let vis = this;

        const defense = vis.FORMATIONS[vis.currentIdx];

        const defenseLabel = document.getElementById("defense-label");

        if (defenseLabel) {
            defenseLabel.textContent = defense.label;
        }
    }

    _updateOverviewBoxes() {
        let vis = this;

        const offense = vis.OFFENSES[vis.currentOffenseIdx];
        const defense = vis.FORMATIONS[vis.currentIdx];

        const offenseTitle = document.getElementById("offense-overview-title");
        const offenseList = document.getElementById("offense-overview-list");

        const defenseTitle = document.getElementById("defense-overview-title");
        const defenseList = document.getElementById("defense-overview-list");

        if (offenseTitle) {
            offenseTitle.textContent = offense.label;
        }

        if (offenseList) {
            offenseList.innerHTML = "";

            offense.overview.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                offenseList.appendChild(li);
            });
        }

        if (defenseTitle) {
            defenseTitle.textContent = defense.label;
        }

        if (defenseList) {
            defenseList.innerHTML = "";

            defense.overview.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                defenseList.appendChild(li);
            });
        }
    }

    _updateMatchupText() {
        let vis = this;

        const offense = vis.OFFENSES[vis.currentOffenseIdx];
        const defense = vis.FORMATIONS[vis.currentIdx];

        const matchupKey = offense.id + "-" + defense.id;

        const fallback = {
            advantage: "Balanced",
            explanation: offense.label + " against " + defense.label + " is a fairly even matchup. The result depends on the play call, down and distance, and whether the offense attacks the defense's weaker personnel group."
        };

        const matchup = vis.MATCHUPS[matchupKey] || fallback;

        const advantageEl = document.getElementById("matchup-advantage");
        const explanationEl = document.getElementById("matchup-explanation");

        if (advantageEl) {
            advantageEl.textContent = matchup.advantage;
        }

        if (explanationEl) {
            explanationEl.textContent = matchup.explanation;
        }
    }

    // ─── Button / modal event bindings ────────────────────────────────────────

    _bindControls() {
        let vis = this;

// Defense previous
        document.getElementById(vis.backBtnId).addEventListener("click", () => {
            vis.currentIdx = (vis.currentIdx - 1 + vis.FORMATIONS.length) % vis.FORMATIONS.length;
            vis.updateVis(true);
        });

// Defense next
        document.getElementById(vis.whistleBtnId).addEventListener("click", () => {
            vis.currentIdx = (vis.currentIdx + 1) % vis.FORMATIONS.length;
            vis.updateVis(true);
        });

        document.getElementById("offense-prev").addEventListener("click", () => {
            vis.currentOffenseIdx = (vis.currentOffenseIdx - 1 + vis.OFFENSES.length) % vis.OFFENSES.length;

            vis._updateOffenseDisplay();
            vis._updateMatchupText();
            vis._updateOffensePlayers(true);
            vis._updateOverviewBoxes();
        });

// Offense next
        document.getElementById("offense-next").addEventListener("click", () => {
            vis.currentOffenseIdx = (vis.currentOffenseIdx + 1) % vis.OFFENSES.length;

            vis._updateOffenseDisplay();
            vis._updateMatchupText();
            vis._updateOffensePlayers(true);
            vis._updateOverviewBoxes();
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