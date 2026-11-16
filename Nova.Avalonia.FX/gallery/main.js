const is_browser = typeof window != "undefined";
if (!is_browser) throw new Error(`Expected to be running in a browser`);

// ?verify, ?bench and ?check results on the page, for browsers without a console at hand, and,
// with ?report=http://127.0.0.1:port/, to scripts/browser-bench.mjs on this machine. Set up
// before the .NET runtime loads, so everything it writes to the console comes through here.
showResults(new URLSearchParams(location.search));
const { dotnet } = await import('./_framework/dotnet.js');

const dotnetRuntime = await dotnet
    .withDiagnosticTracing(false)
    .withApplicationArgumentsFromQuery()
    .create();

// For the gallery's ?bench: how many frames a second the browser paints the page (a hidden tab,
// or a page in a hidden pane, paints one or none, while it may still say it is visible), and
// what it runs on.
dotnetRuntime.setModuleImports("main.js", {
    isVisible: () => document.visibilityState === "visible",
    frameRate: (ms) => new Promise(resolve => {
        const start = performance.now();
        let frames = 0;
        const done = () => resolve(frames * 1000 / (performance.now() - start));
        const tick = () => { frames++; if (performance.now() - start < ms) requestAnimationFrame(tick); else done(); };
        requestAnimationFrame(tick);
        setTimeout(done, ms + 250);
    }),
    describe: () => {
        let gpu = "unknown GPU";
        try {
            const gl = document.createElement("canvas").getContext("webgl2");
            const ext = gl && gl.getExtension("WEBGL_debug_renderer_info");
            if (ext) gpu = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
            gl && gl.getExtension("WEBGL_lose_context")?.loseContext();
        } catch { }
        return `${navigator.userAgent}; ${gpu}; ${innerWidth}x${innerHeight} at ${devicePixelRatio}x`;
    },
});

const config = dotnetRuntime.getConfig();

await dotnetRuntime.runMain(config.mainAssemblyName, [globalThis.location.href]);

function showResults(query) {
    const testing = ["verify", "bench", "check"].some(k => query.has(k));
    let report = null;
    try {
        const url = new URL(query.get("report") ?? "");
        // Only to this machine: the results go nowhere else.
        if (url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) report = url;
    } catch { }
    if (!testing && !report) return;
    let panel = null;
    if (testing) {
        panel = document.createElement("pre");
        panel.className = "fx-results";
        panel.title = "Click to hide";
        panel.addEventListener("click", () => panel.remove());
        document.body.appendChild(panel);
    }
    let queue = [], sending = Promise.resolve(), timer = 0;
    const flush = () => {
        timer = 0;
        const body = queue.join("\n");
        queue = [];
        sending = sending.then(() => fetch(report, { method: "POST", mode: "no-cors", body })).catch(() => { });
    };
    const add = (level, args) => {
        const text = args.map(a => typeof a === "string" ? a : a instanceof Error ? (a.stack ?? String(a)) : String(a)).join(" ");
        if (panel && text.startsWith("Nova.FX")) {
            panel.textContent += text.slice(8) + "\n";
            panel.scrollTop = panel.scrollHeight;
        }
        if (report) {
            queue.push(level === "log" || level === "info" ? text : `${level}: ${text}`);
            timer ||= setTimeout(flush, 150);
        }
    };
    for (const level of ["log", "info", "warn", "error"]) {
        const original = console[level].bind(console);
        console[level] = (...args) => { original(...args); add(level, args); };
    }
    addEventListener("error", e => add("error", [e.message]));
    addEventListener("unhandledrejection", e => add("error", [String(e.reason)]));
}
