# jsuarezruiz.github.io

Documentation sites and galleries for my projects, served from GitHub Pages.

| Project | Documentation | Gallery | Source |
| --- | --- | --- | --- |
| Nova.Avalonia.AIKit | [Docs](https://jsuarezruiz.github.io/Nova.Avalonia.AIKit/) | [Gallery](https://jsuarezruiz.github.io/Nova.Avalonia.AIKit/gallery/) | Private |
| Nova.Avalonia.Animations | [Docs](https://jsuarezruiz.github.io/Nova.Avalonia.Animations/) | [Gallery](https://jsuarezruiz.github.io/Nova.Avalonia.Animations/gallery/) | Private |

## Layout

Each project lives in a folder named after its repository, which becomes the URL path:

- The folder root holds the DocFX site (the project's `docs/_site` output).
- `gallery/` holds the published WebAssembly sample (the `publish/wwwroot` output of `dotnet publish -c Release -r browser-wasm`).

The `.nojekyll` files stop Jekyll from dropping `_framework` and other folders that start with an underscore. Keep them when replacing a folder.

If a project repository enables its own GitHub Pages site, it takes over the same path, so keep Pages disabled there while the site is published from here.