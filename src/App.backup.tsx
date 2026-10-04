import { useEffect, useMemo, useState } from "react";

type View = "landing" | "workspace" | "running" | "results" | "history" | "compare";

const workflow = [
  { id: "01", name: "INPUT", description: "Parameters validated" },
  { id: "02", name: "LAMMPS", description: "Molecular dynamics simulation" },
  { id: "03", name: "ANALYSIS", description: "Material-property extraction" },
  { id: "04", name: "OVITO", description: "Deformation visualization" },
  { id: "05", name: "RESULT", description: "Final computational report" },
];

const experiments = [
  { id: "003", material: "Silicon", temp: "500 K", date: "03 OCT 2026", bulk: "94.82", shear: "44.72", poisson: "0.401" },
  { id: "002", material: "Copper", temp: "300 K", date: "28 SEP 2026", bulk: "137.10", shear: "48.30", poisson: "0.343" },
  { id: "001", material: "Silicon", temp: "300 K", date: "22 SEP 2026", bulk: "97.07", shear: "46.01", poisson: "0.394" },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="LAMMPS Automation">
      <svg className="brand-mark" viewBox="0 0 28 28" aria-hidden="true">
        <path d="M4 5h9v9H4zM15 14h9v9h-9zM13 9h6v2h-6zM9 14h2v6H9z" />
        <circle cx="5" cy="23" r="2" />
        <circle cx="23" cy="5" r="2" />
      </svg>
      <span>LAMMPS {!compact && <small>AUTOMATION</small>}</span>
    </div>
  );
}

function Arrow() {
  return <span className="arrow" aria-hidden="true">↗</span>;
}

function PrimaryButton({ children, onClick, type = "button" }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
  return <button className="button button-primary" onClick={onClick} type={type}>{children}<Arrow /></button>;
}

function SecondaryButton({ children, onClick, active = false }: { children: React.ReactNode; onClick?: () => void; active?: boolean }) {
  return <button className={`button button-secondary ${active ? "active" : ""}`} onClick={onClick}>{children}</button>;
}

function AtomViewer({ variant = "idle", progress = 0, label = true }: { variant?: "hero" | "idle" | "running" | "result"; progress?: number; label?: boolean }) {
  const points = useMemo(() => {
    const items: { x: number; y: number; z: number; r: number }[] = [];
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 11; col += 1) {
        const z = ((row * 7 + col * 3) % 9) / 9;
        items.push({
          x: 55 + col * 54 + (row % 2) * 26,
          y: 48 + row * 48 + ((col * 5) % 3) * 4,
          z,
          r: 2.2 + z * 3.3,
        });
      }
    }
    return items;
  }, []);
  const deformation = variant === "running" ? Math.min(progress / 15, 7) : variant === "result" ? 8 : 0;

  return (
    <div className={`atom-viewer atom-${variant}`}>
      <svg viewBox="0 0 680 440" role="img" aria-label="Silicon crystal lattice visualization">
        <defs>
          <radialGradient id={`atomGlow-${variant}`}>
            <stop offset="0" stopColor="#e9fbff" />
            <stop offset=".38" stopColor="#83d7e8" />
            <stop offset="1" stopColor="#1c5a67" />
          </radialGradient>
          <filter id={`softGlow-${variant}`} x="-200%" y="-200%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g className="viewer-grid">
          {Array.from({ length: 12 }).map((_, i) => <path key={`v${i}`} d={`M${i * 68 - 30} 0L${i * 68 - 130} 440`} />)}
          {Array.from({ length: 9 }).map((_, i) => <path key={`h${i}`} d={`M0 ${i * 55}H680`} />)}
        </g>
        <g className="simulation-box"><path d="M62 38H620V393H62Z" /><path d="M62 38l36-22h558l-36 22M620 38l36-22v355l-36 22" /></g>
        <g className="bonds">
          {points.map((p, i) => {
            const next = points[i + 1];
            if (!next || (i + 1) % 11 === 0) return null;
            return <line key={i} x1={p.x + deformation * (p.y / 440)} y1={p.y} x2={next.x + deformation * (next.y / 440)} y2={next.y} />;
          })}
        </g>
        <g className="atoms">
          {points.map((p, i) => (
            <circle
              className="atom-dot"
              style={{ animationDelay: `${(i % 13) * -0.17}s` }}
              key={i}
              cx={p.x + deformation * (p.y / 440)}
              cy={p.y}
              r={p.r}
              opacity={0.45 + p.z * 0.55}
              fill={`url(#atomGlow-${variant})`}
              filter={p.z > 0.7 ? `url(#softGlow-${variant})` : undefined}
            />
          ))}
        </g>
        <g className="axis">
          <path d="M92 365v-34M92 365h36M92 365l-20 13" />
          <text x="88" y="324">Z</text><text x="134" y="369">X</text><text x="59" y="388">Y</text>
        </g>
      </svg>
      {label && <div className="viewer-corners"><span>ATOMISTIC MODEL</span><span>Si / 216 ATOMS</span><span>UNIT CELL 3×3×3</span><span>{variant === "running" ? `FRAME ${Math.round(progress * 6.01)} / 601` : "LAMMPS / OVITO"}</span></div>}
    </div>
  );
}

function LandingNav({ onStart }: { onStart: () => void }) {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <nav className="landing-nav">
      <Logo />
      <div className="nav-links">
        <button onClick={() => scrollTo("workflow")}>WORKFLOW</button>
        <button onClick={() => scrollTo("capabilities")}>CAPABILITIES</button>
        <button onClick={() => scrollTo("about")}>ABOUT</button>
      </div>
      <button className="nav-cta" onClick={onStart}>GET STARTED <span>↗</span></button>
    </nav>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <main className="landing">
      <LandingNav onStart={onStart} />
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> COMPUTATIONAL EXPERIMENTS, AUTOMATED.</div>
          <h1>COMPUTATIONAL<br /><em>MATERIALS</em><br />AUTOMATION</h1>
          <div className="hero-bottom">
            <p>Automate atomistic simulations from input parameters to material-property analysis and visualization.</p>
            <div className="hero-actions">
              <PrimaryButton onClick={onStart}>GET STARTED</PrimaryButton>
              <button className="text-link" onClick={() => document.getElementById("workflow")?.scrollIntoView({ behavior: "smooth" })}>EXPLORE WORKFLOW ↓</button>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <AtomViewer variant="hero" />
          <div className="hero-spec spec-one"><b>SILICON</b><span>300 K</span></div>
          <div className="hero-spec spec-two"><b>FRAME</b><span>601</span></div>
          <div className="hero-index">LA — 001<br />SYSTEM / READY</div>
        </div>
        <div className="hero-rail">PYTHON · LAMMPS · ANALYSIS · OVITO</div>
      </section>

      <section className="why section" id="workflow">
        <div className="section-kicker">01 / WORKFLOW</div>
        <div className="section-intro">
          <h2>WHY<br />AUTOMATION?</h2>
          <p>Simulation workflows move through multiple tools, files, analysis steps, and visualization stages. LAMMPS Automation brings them into one precise computational workflow.</p>
        </div>
        <div className="vertical-workflow">
          {workflow.map((item, index) => (
            <div className="flow-row" key={item.name}>
              <span>{item.id}</span><h3>{item.name}</h3><p>{item.description}</p><i>{index < workflow.length - 1 ? "↓" : "↗"}</i>
            </div>
          ))}
        </div>
      </section>

      <section className="capabilities section" id="capabilities">
        <div className="section-kicker">02 / CAPABILITIES</div>
        <h2>ONE WORKFLOW.<br /><em>MULTIPLE COMPUTATIONAL STAGES.</em></h2>
        <div className="capability-list">
          {[
            ["DEFINE", "Set simulation parameters and physical conditions."],
            ["COMPUTE", "Run atomistic molecular dynamics in LAMMPS."],
            ["ANALYZE", "Extract elastic constants and material properties."],
            ["OBSERVE", "Inspect atomic deformation frame by frame."],
            ["UNDERSTAND", "Turn simulation output into physical insight."],
          ].map((item, index) => <div className="capability" key={item[0]}><span>0{index + 1}</span><h3>{item[0]}</h3><p>{item[1]}</p></div>)}
        </div>
      </section>

      <section className="about section" id="about">
        <div className="section-kicker">03 / THE LABORATORY</div>
        <div className="about-grid">
          <h2>FROM INPUT<br />TO <em>INSIGHT.</em></h2>
          <div><p>A focused environment for defining, running, observing, and understanding computational materials experiments.</p><PrimaryButton onClick={onStart}>ENTER THE LABORATORY</PrimaryButton></div>
        </div>
        <div className="architecture">PYTHON <span>→</span> LAMMPS <span>→</span> SIMULATION <span>→</span> ANALYSIS <span>→</span> OVITO <span>→</span> RESULTS</div>
      </section>
      <footer><Logo /><span>COMPUTATIONAL EXPERIMENTS, AUTOMATED.</span><span>© 2026</span></footer>
    </main>
  );
}

function AppNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  return (
    <nav className="app-nav">
      <button className="logo-button" onClick={() => setView("landing")}><Logo /></button>
      <div className="app-tabs">
        <button className={["workspace", "running", "results"].includes(view) ? "active" : ""} onClick={() => setView("workspace")}>EXPERIMENT</button>
        <button className={["history", "compare"].includes(view) ? "active" : ""} onClick={() => setView("history")}>HISTORY</button>
      </div>
      <div className="system-ready"><span /> SYSTEM READY</div>
    </nav>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Workspace({ onStart }: { onStart: () => void }) {
  const [advanced, setAdvanced] = useState(false);
  const [material, setMaterial] = useState("Silicon");
  const [temperature, setTemperature] = useState("300");
  return (
    <main className="app-page workspace-page">
      <header className="page-heading">
        <div><div className="eyebrow"><span /> NEW COMPUTATIONAL RUN</div><h1>DEFINE YOUR <em>EXPERIMENT</em></h1></div>
        <div className="heading-meta">SIMULATION ID<br /><b>EXP-004</b></div>
      </header>
      <div className="workspace-grid">
        <section className="parameter-panel">
          <div className="panel-heading"><span>01</span><h2>SIMULATION PARAMETERS</h2><i>REQUIRED</i></div>
          <div className="form-grid">
            <Field label="MATERIAL"><select value={material} onChange={(e) => setMaterial(e.target.value)}><option>Silicon</option><option>Aluminium</option><option>Copper</option><option>Iron</option></select></Field>
            <Field label="TEMPERATURE"><div className="unit-field"><input value={temperature} onChange={(e) => setTemperature(e.target.value)} inputMode="decimal" /><span>K</span></div></Field>
            <Field label="STRAIN RATE"><input defaultValue="0.001" inputMode="decimal" /></Field>
            <Field label="SIMULATION TYPE"><select defaultValue="Elastic Deformation"><option>Elastic Deformation</option><option>Uniaxial Tension</option><option>Thermal Expansion</option></select></Field>
            <Field label="POTENTIAL"><select defaultValue="Stillinger-Weber"><option>Stillinger-Weber</option><option>MEAM</option><option>EAM</option></select></Field>
            <Field label="SIMULATION STEPS"><input defaultValue="3000" inputMode="numeric" /></Field>
          </div>
          <button className={`accordion-trigger ${advanced ? "open" : ""}`} onClick={() => setAdvanced(!advanced)}><span>ADVANCED PARAMETERS</span><i>{advanced ? "−" : "+"}</i></button>
          {advanced && <div className="form-grid advanced-fields">
            <Field label="TIMESTEP"><input defaultValue="0.001 ps" /></Field>
            <Field label="EQUILIBRATION STEPS"><input defaultValue="1000" /></Field>
            <Field label="DUMP FREQUENCY"><input defaultValue="5" /></Field>
            <Field label="RANDOM SEED"><input defaultValue="492813" /></Field>
          </div>}
          <div className="start-row">
            <PrimaryButton onClick={onStart}>START AUTOMATION</PrimaryButton>
            <p>Runs the computational workflow<br />from LAMMPS to analysis.</p>
          </div>
        </section>
        <section className="preview-panel">
          <div className="panel-heading"><span>02</span><h2>ATOMISTIC PREVIEW</h2><i>LIVE MODEL</i></div>
          <AtomViewer variant="idle" />
          <div className="preview-meta">
            <div><span>MATERIAL</span><b>{material.toUpperCase()}</b></div><div><span>TEMPERATURE</span><b>{temperature} K</b></div>
            <div><span>DEFORMATION</span><b>ELASTIC</b></div><div><span>POTENTIAL</span><b>STILLINGER-WEBER</b></div>
          </div>
        </section>
      </div>
    </main>
  );
}

function WorkflowRail({ progress }: { progress: number }) {
  const activeIndex = Math.min(4, Math.floor(progress / 20));
  return (
    <div className="workflow-rail">
      <div className="rail-line"><i style={{ width: `${progress}%` }} /></div>
      {workflow.map((item, index) => <div className={`rail-stage ${index < activeIndex ? "complete" : index === activeIndex ? "running" : ""}`} key={item.name}><span>{index < activeIndex ? "✓" : item.id}</span><b>{item.name}</b><small>{item.description}</small></div>)}
    </div>
  );
}

function Running({ progress, onComplete }: { progress: number; onComplete: () => void }) {
  const stage = progress < 20 ? "INITIALIZING EXPERIMENT" : progress < 62 ? "LAMMPS SIMULATION" : progress < 78 ? "ANALYZING OUTPUT" : progress < 94 ? "OVITO ANALYSIS" : "FINALIZING RESULTS";
  return (
    <main className="app-page running-page">
      <header className="experiment-header">
        <div><div className="eyebrow"><span /> EXPERIMENT IN PROGRESS</div><h1>EXPERIMENT <em>004</em></h1><p>SILICON / 300 K / ELASTIC DEFORMATION</p></div>
        <div className="run-status"><span className="pulse" /> RUNNING</div>
      </header>
      <WorkflowRail progress={progress} />
      <section className="simulation-stage">
        <div className="simulation-title"><span>{stage}</span><b>RUNNING</b></div>
        <AtomViewer variant="running" progress={progress} />
        <div className="simulation-data">
          <div><span>FRAME</span><b>{Math.round(progress * 6.01)} / 601</b></div>
          <div><span>STEP</span><b>{Math.round(progress * 30)} / 3000</b></div>
          <div><span>TEMPERATURE</span><b>300 K</b></div>
          <div><span>STRAIN RATE</span><b>0.001</b></div>
          <div className="progress-number"><b>{Math.round(progress)}%</b></div>
        </div>
        <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
        <div className="viewer-controls"><button>Ⅱ</button><button>↺</button><div><i style={{ width: `${progress}%` }} /><span style={{ left: `${progress}%` }} /></div><small>FRAME {Math.round(progress * 6.01)}</small></div>
      </section>
      <button className="skip-button" onClick={onComplete}>COMPLETE DEMO RUN →</button>
    </main>
  );
}

function StressChart() {
  return (
    <svg className="chart" viewBox="0 0 800 360" role="img" aria-label="Stress strain response graph">
      <g className="chart-grid">{[50, 105, 160, 215, 270].map((y) => <line key={y} x1="72" y1={y} x2="770" y2={y} />)}{[72, 211, 350, 489, 628, 767].map((x) => <line key={x} x1={x} y1="25" x2={x} y2="285" />)}</g>
      <path className="chart-area" d="M72 277C155 262 187 230 247 212S342 176 404 162 520 109 585 91 692 62 767 38V285H72Z" />
      <path className="chart-line" pathLength="1" d="M72 277C155 262 187 230 247 212S342 176 404 162 520 109 585 91 692 62 767 38" />
      <g className="chart-labels"><text x="20" y="55">2.0</text><text x="20" y="165">1.0</text><text x="27" y="279">0.0</text><text x="65" y="316">0.00</text><text x="340" y="316">0.02</text><text x="742" y="316">0.05</text><text x="380" y="350">STRAIN</text><text transform="rotate(-90 10 185)" x="10" y="185">STRESS (GPa)</text></g>
    </svg>
  );
}

function Results({ setView }: { setView: (view: View) => void }) {
  return (
    <main className="app-page results-page">
      <header className="experiment-header result-header">
        <div><div className="eyebrow success"><span /> COMPUTATION COMPLETE</div><h1>EXPERIMENT <em>004</em></h1><p>SILICON · 300 K · ELASTIC DEFORMATION</p></div>
        <div className="result-actions"><SecondaryButton onClick={() => setView("workspace")}>RUN AGAIN</SecondaryButton><SecondaryButton onClick={() => setView("compare")}>COMPARE</SecondaryButton><SecondaryButton>EXPORT REPORT ↓</SecondaryButton></div>
      </header>
      <WorkflowRail progress={100} />
      <section className="results-intro">
        <div className="section-kicker">COMPUTATIONAL REPORT / EXP-004</div>
        <h2>MATERIAL <em>RESPONSE</em></h2>
        <p>Elastic properties extracted from the completed molecular dynamics simulation.</p>
      </section>
      <section className="metric-grid">
        {[["BULK MODULUS", "97.07", "GPa"], ["SHEAR MODULUS", "46.01", "GPa"], ["POISSON RATIO", "0.394", ""]].map((item, index) => <div className="metric" key={item[0]}><span>0{index + 1} / {item[0]}</span><div><b>{item[1]}</b><i>{item[2]}</i></div></div>)}
      </section>
      <section className="constants-section">
        <div><div className="section-kicker">ELASTIC CONSTANTS</div><h2>CRYSTAL<br />STIFFNESS</h2></div>
        <div className="constant-list"><div><span>C11</span><b>124.64</b><i>GPa</i></div><div><span>C12</span><b>83.43</b><i>GPa</i></div><div><span>C44</span><b>33.40</b><i>GPa</i></div></div>
      </section>
      <section className="chart-section">
        <div className="chart-heading"><div><span>ANALYSIS / 01</span><h2>STRESS / STRAIN RESPONSE</h2></div><p>Calculated engineering stress across applied deformation.</p></div>
        <StressChart />
      </section>
      <section className="deformation-section">
        <div className="chart-heading"><div><span>ANALYSIS / 02</span><h2>DEFORMATION ANALYSIS</h2></div><p>Atomic displacement relative to the equilibrated reference structure.</p></div>
        <div className="displacement-data">
          <div><span>MEAN DISPLACEMENT</span><b>0.114 <i>Å</i></b></div><div><span>MAXIMUM DISPLACEMENT</span><b>0.279 <i>Å</i></b></div><div><span>MINIMUM DISPLACEMENT</span><b>0.012 <i>Å</i></b></div>
        </div>
      </section>
      <section className="final-visual">
        <div className="final-visual-heading"><div><span>FINAL SIMULATION FRAME</span><h2>ATOMIC <em>DEFORMATION</em></h2></div><small>OVITO / DISPLACEMENT VECTORS</small></div>
        <AtomViewer variant="result" />
        <div className="technical-strip"><span>FRAME <b>601 / 601</b></span><span>ATOM COUNT <b>216</b></span><span>MEAN DISPLACEMENT <b>0.114 Å</b></span><span>ENGINE <b>OVITO 3.10</b></span></div>
      </section>
    </main>
  );
}

function History({ setView }: { setView: (view: View) => void }) {
  const [selected, setSelected] = useState<string[]>(["003", "001"]);
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((x) => x !== id) : current.length < 2 ? [...current, id] : [current[1], id]);
  return (
    <main className="app-page history-page">
      <header className="page-heading history-heading"><div><div className="eyebrow"><span /> LABORATORY ARCHIVE</div><h1>EXPERIMENT <em>HISTORY</em></h1><p>A record of computational experiments.</p></div><PrimaryButton onClick={() => setView("workspace")}>NEW EXPERIMENT</PrimaryButton></header>
      <div className="archive-tools"><span>{experiments.length} COMPUTATIONAL RECORDS</span><SecondaryButton active={selected.length === 2} onClick={() => selected.length === 2 && setView("compare")}>COMPARE SELECTED ({selected.length}/2)</SecondaryButton></div>
      <section className="archive-list">
        {experiments.map((experiment) => <article className="history-item" key={experiment.id}>
          <button className={`select-record ${selected.includes(experiment.id) ? "selected" : ""}`} onClick={() => toggle(experiment.id)} aria-label={`Select experiment ${experiment.id}`}><span /></button>
          <div className="history-number"><span>EXPERIMENT</span><b>{experiment.id}</b></div>
          <div className="history-description"><h2>{experiment.material.toUpperCase()} / {experiment.temp} / ELASTIC DEFORMATION</h2><div><span className="complete-dot" /> COMPLETED</div></div>
          <div className="history-date"><span>DATE</span><b>{experiment.date}</b></div>
          <button className="history-open" onClick={() => setView("results")}>VIEW RESULTS <Arrow /></button>
        </article>)}
      </section>
    </main>
  );
}

function Compare({ setView }: { setView: (view: View) => void }) {
  const rows = [
    ["MATERIAL", "Silicon", "Silicon", ""], ["TEMPERATURE", "300 K", "500 K", ""], ["STRAIN RATE", "0.001", "0.001", ""],
    ["BULK MODULUS", "97.07", "94.82", "GPa"], ["SHEAR MODULUS", "46.01", "44.72", "GPa"], ["POISSON RATIO", "0.394", "0.401", ""],
    ["C11", "124.64", "121.08", "GPa"], ["C12", "83.43", "81.69", "GPa"], ["C44", "33.40", "32.11", "GPa"],
  ];
  return (
    <main className="app-page compare-page">
      <button className="back-link" onClick={() => setView("history")}>← BACK TO ARCHIVE</button>
      <header className="page-heading"><div><div className="eyebrow"><span /> SCIENTIFIC COMPARISON</div><h1>COMPARE <em>EXPERIMENTS</em></h1><p>Inspect how changed conditions affect the material response.</p></div></header>
      <section className="comparison">
        <div className="comparison-head"><div>PROPERTY / CONDITION</div><div><span>EXPERIMENT 001</span><b>SILICON / 300 K</b></div><div><span>EXPERIMENT 003</span><b>SILICON / 500 K</b></div></div>
        {rows.map((row, index) => <div className={`comparison-row ${index === 3 ? "section-start" : ""}`} key={row[0]}><div>{row[0]}</div><div><b>{row[1]}</b><span>{row[3]}</span></div><div><b>{row[2]}</b><span>{row[3]}</span></div></div>)}
      </section>
      <div className="compare-note"><span>Δ</span><p>Values are presented for direct scientific comparison. Interpretation depends on simulation conditions, potential selection, and material model.</p></div>
    </main>
  );
}

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [transitioning, setTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);

  const enterLab = () => {
    setTransitioning(true);
    window.setTimeout(() => { setView("workspace"); window.scrollTo(0, 0); }, 700);
    window.setTimeout(() => setTransitioning(false), 1300);
  };

  const startAutomation = () => {
    setProgress(2);
    setView("running");
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (view !== "running") return;
    const timer = window.setInterval(() => setProgress((value) => Math.min(value + 0.45, 100)), 80);
    return () => window.clearInterval(timer);
  }, [view]);

  useEffect(() => {
    if (view === "running" && progress >= 100) {
      const timer = window.setTimeout(() => { setView("results"); window.scrollTo(0, 0); }, 700);
      return () => window.clearTimeout(timer);
    }
  }, [progress, view]);

  const navigate = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className={`site-shell view-${view}`}>
      {view === "landing" ? <Landing onStart={enterLab} /> : <>
        <AppNav view={view} setView={navigate} />
        {view === "workspace" && <Workspace onStart={startAutomation} />}
        {view === "running" && <Running progress={progress} onComplete={() => { setProgress(100); }} />}
        {view === "results" && <Results setView={navigate} />}
        {view === "history" && <History setView={navigate} />}
        {view === "compare" && <Compare setView={navigate} />}
      </>}
      {transitioning && <div className="lab-transition"><div className="transition-lattice"><AtomViewer variant="hero" label={false} /></div><div className="transition-copy"><span>ENTERING COMPUTATIONAL ENVIRONMENT</span><b>LAB / 001</b></div></div>}
    </div>
  );
}
