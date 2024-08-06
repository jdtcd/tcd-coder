# Change Log

## [0.0.3] - 2024-08-06

### Changed

- Separate Coder environments settings from Docker environment settings


## [0.0.2] - 2024-08-02

### Changed

- Look in all workspace root folders for `.tcd-coder.json` and attempt to
  automatically detect and apply settings for each distinct module found.
- Rename `tcd-coder.json` as `.tcd-coder.json`.

## [0.0.1] - 2024-07-31

- Initial release
- Manually apply VSCode settings for a module and a platform/environment
- Automatically detect certain platforms/environments and apply relevant settings
- Detect when a workspace has ben opened using an SCSS UNC path and prompt to re-open