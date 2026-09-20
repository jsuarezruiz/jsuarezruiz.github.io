document.getElementById('reload-gallery').addEventListener('click', () => location.reload());

try {
    // Relative imports support repository Pages URLs. A dynamic import also lets us
    // show a useful error when the runtime itself fails to download.
    const { dotnet } = await import('./_framework/dotnet.js');
    const runtime = await dotnet
        .withDiagnosticTracing(false)
        .withApplicationArgumentsFromQuery()
        .create();

    const config = runtime.getConfig();

    // runMain keeps the runtime alive after Main returns; the Avalonia app loop needs that.
    // Avalonia dismisses .avalonia-splash after its first render with the splash-close class.
    await runtime.runMain(config.mainAssemblyName, [globalThis.location.href]);
} catch (error) {
    console.error('Nova.Avalonia.Animations failed to start.', error);
    document.querySelector('.avalonia-splash')?.remove();
    document.getElementById('startup-error').hidden = false;
    document.getElementById('reload-gallery').focus();
}
