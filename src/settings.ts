import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('path');

const MODULE_CONFIG_PATH = path.join(__dirname, '..', 'resources', 'settings');

interface IModuleConfig {
	name: string;
	ordinal?: number;
	moduleSettings: object;
}

interface IModuleSettings {
	auto: [
		{
			envKey: string;
			envValue: string;
			settings: string;
		}
	]
}

// Implementation of command 'Apply Configuration'
// Applies configurations settings from a JSON object
//   to VSCode user settings.
export async function applyConfig() {

    // Retrieve available modules and ask user to select one
    const moduleId = await quickPickModule();

	if (moduleId === undefined) {
		return;
	}

	// Retrieve available configurations and ask user to select one
	const moduleConfig = await quickPickConfig(moduleId);

	if (moduleConfig === undefined) {
		return;
	}

	console.log("Selected " + moduleConfig + " for module " + moduleId);

	applyModuleConfigFile(moduleId, moduleConfig);
}

export async function detectAndApplyConfig() {

	const workspaceFolders = vscode.workspace.workspaceFolders;

	if (workspaceFolders === undefined) {
		return;
	}

	let settingsFile = '';
	for (let i = 0; i < workspaceFolders.length; i++) {
		// Build the path to tcd-coder.json
		const testFile = path.join(workspaceFolders[i].uri.fsPath, 'tcd-coder.json');
		if (!fs.existsSync(testFile)) {
			continue;
		} else {
			settingsFile = testFile;
			break;
		}
	}

	console.log('Using TCD Coder settings file: ' + settingsFile);

	// Read the TCD coder settings file
	const rawJson = fs.readFileSync(settingsFile, 'utf8');
	const config = JSON.parse(rawJson);
	if (config === undefined || config.module === undefined) {
		console.log('Error parsing TCD Coder settings file');
		return;
	}
	const moduleId = config.module;
	const moduleSettingsFile = path.join(MODULE_CONFIG_PATH, moduleId, "settings.json");

	if (!fs.existsSync(moduleSettingsFile)) {
		console.log('No settings file found for module ' + moduleId + ' (' + moduleSettingsFile + ')');
		return;
	}

	// Read the JSON configuration file
	const autoChecks = [];
	try {
		const rawJson = fs.readFileSync(path.join(MODULE_CONFIG_PATH, moduleId, "settings.json"), 'utf8');
		const config = JSON.parse(rawJson) as IModuleSettings;	
		autoChecks.push(...config.auto);	
	}
	catch (err) {
		console.log("Error parsing settings file (" + settingsFile + ") for module " + moduleId);
		return;
	}

	for (let i = 0; i < autoChecks.length; i++) {
		const check = autoChecks[i];
		const envValue = process.env[check.envKey];
		if (envValue === check.envValue) {
			console.log('Auto-configuring: ' + check.settings + ' for ' + moduleId);
			await applyModuleConfigFile(moduleId, check.settings);
			break;
		}
	}
}

async function quickPickModule(): Promise<string | undefined> {
    const settignsDirEnts = fs.readdirSync(MODULE_CONFIG_PATH, { withFileTypes: true });
    const moduleNames = settignsDirEnts.filter((ent) => ent.isDirectory()).map((ent) => ent.name);

    if (moduleNames.length === 0) {
        vscode.window.showInformationMessage('No modules found.');
        return undefined;
    }

    // Prompt user to select a module
    const pick = await vscode.window.showQuickPick(moduleNames, {
        placeHolder: "Select the module for which you want to configure Visual Studio Code",
        canPickMany: false
    });

	if (pick !== undefined) {
		return pick;
	} else {
		return undefined;
	}
}


async function quickPickConfig(moduleId: string): Promise<(string | undefined)> {

	class QuickPickModuleConfig implements vscode.QuickPickItem {
		label: string;
		description: string;
		configFile: string;
		ordinal: number = 99;
		constructor(filename: string, config: IModuleConfig) {
			this.label = config.name;
			this.description = filename;
			this.configFile = filename;
			this.ordinal = config.ordinal || 99;
		}
	}

	const configFiles = fs.readdirSync(path.join(MODULE_CONFIG_PATH, moduleId));

	const qpItems = [];
	for (const configFile of configFiles) {
		console.log("Found: " + configFile);
		const config = readConfig(moduleId, configFile);
		if (config === undefined) {
			continue;
		}
		qpItems.push(new QuickPickModuleConfig(configFile, config));
	}

	if (qpItems.length === 0) {
		vscode.window.showInformationMessage('No configurations found.');
		return undefined;
	}

	qpItems.sort((a, b) => a.ordinal - b.ordinal);

	// Prompt user to select a module
	const pick = await vscode.window.showQuickPick(qpItems, {
		placeHolder: "Select your environment",
		canPickMany: false
	});

	return pick?.configFile;
}

async function applyModuleConfigFile(moduleId: string, configFile: string) {

	const configuration = readConfig(moduleId, configFile);

	if (configuration === undefined || configuration.moduleSettings === undefined) {
		return;
	}

	const moduleConfigs = vscode.workspace.getConfiguration('tcd-coder.modules');

    try {
        await moduleConfigs.update(moduleId, configuration.moduleSettings, vscode.ConfigurationTarget.Global);
    }
    catch (err) {
        vscode.window.showErrorMessage("Error updating settings for " + moduleId);
    }
}

function readConfig(moduleId: string, configFile: string): IModuleConfig | undefined {
	try {
		const rawJson = fs.readFileSync(path.join(MODULE_CONFIG_PATH, moduleId, configFile), 'utf8');
		return JSON.parse(rawJson) as IModuleConfig;
	}
	catch (err) {
		console.log("Error parsing file: " + configFile);
		console.log(err);		
		return undefined;
	}
}
