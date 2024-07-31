# TCD Coder extension for Visual Studio Code

This small Visual Studio Code extension is intended for students taking modules in the [School of Computer Science and Statistics](https://www.scss.tcd.ie) at [Trinity College Dublin](https://www.tcd.ie).

The extension provides module-specific configuration settings for Visual Studio Code that are then used by other extensions (e.g. Cortex-Debug), tasks and launch configurations. The settings simplify cross-platform support.

## Features

### Manually choose a module and environment and apply settings
The `Apply Settings ...` command allows you to choose a module and an environment profile and then sets appropriate Visual Studio Code settings to support the chosen module.

### Auto-detect environment and module and apply settings
On startup, the extension will also attempt to auto-detect the environment and apply an appropriate settings profile.

### Detect and warn about UNC paths
Since network UNC paths are not supported by the toolchain used in the module, the extension will attempt to detect when a folder or workspace is incorrectly opened using a TCD School of Computer Science and Statistics UNC path and, if possible, will prompt the user to re-open the folder/workspace using a mapped drive.

## Use

### Manual application of settings

Use the `Apply Settings ...` command to chose a module and environment.

### Automatic delection of environment and application of module settings 

To support automatic detection of encironments and automatic application of module settings, the extension is activated when a folder is opened that contains a `tcd-coder.json` file. In a multi-root workspace, this can be in the root of any of the folders included in the workspace.

Only one `key:value` pair is currently supported in the `tcd-coder.json` file. The `module` key identifies the module for which settings should be applied. The module identifier MUST correspond to one of the modules supported by the extension, for example:

```JSON
{
    "module": "CSU11021"
}
```

## Planned Features

 - List repositories available in a configured GitLab group and provide a simple means to clone a selected project and add it to the current multi-root workspace.

## Known Issues

No known issues