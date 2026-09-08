import { dotnet } from './_framework/dotnet.js';

const runtime = await dotnet
    .withDiagnosticTracing(false)
    .withApplicationArgumentsFromQuery()
    .create();

const config = runtime.getConfig();

// runMain keeps the runtime alive after Main returns; the Avalonia app loop needs that.
await runtime.runMain(config.mainAssemblyName, [globalThis.location.href]);
