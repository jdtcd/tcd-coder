import * as vscode from 'vscode';
import * as fs from 'fs';
import path = require('path');

interface IHelperConfig {
	name: string;
	ordinal?: number;
	moduleConfiguration: object;
}


async function quickPickModule(settingsPath: string): Promise<string | undefined> {
    const settignsDirEnts = fs.readdirSync(settingsPath, { withFileTypes: true });
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


async function quickPickConfig(settingsPath: string): Promise<(IHelperConfig | undefined)> {

	class QuickPickModuleConfig implements vscode.QuickPickItem {
		label: string;
		description: string;
		spec: IHelperConfig;
		ordinal: number = 99;
		constructor(filename: string, config: IHelperConfig) {
			this.label = config.name;
			this.description = filename;
			this.spec = config;
			this.ordinal = config.ordinal || 99;
		}
	}

	const settingsFiles = fs.readdirSync(settingsPath);

	const qpItems = [];
	for (const file of settingsFiles) {
		console.log("Found: " + file);
		const configPath = path.join(settingsPath, file);
		try {
			const rawJson = fs.readFileSync(configPath, 'utf8');
			const config = JSON.parse(rawJson);	
			qpItems.push(new QuickPickModuleConfig(file, config));
		} catch (err) {
			console.log("Error parsing file: " + file);
			console.log(err);
		}
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

	return pick?.spec as IHelperConfig;
}


// Implementation of command 'Apply Configuration'
// Applies configurations settings from a JSON object
//   to VSCode user settings.
export async function applyConfig() {

    const settingsPath = path.join(__dirname, '..', 'resources', 'settings');

    // Retrieve available modules and ask user to select one
    const pickModuleId = await quickPickModule(settingsPath);

	if (pickModuleId === undefined) {
		return;
	}

    const modulePath = path.join(settingsPath, pickModuleId);

	// Retrieve available configurations and ask user to select one
	const pickConf = await quickPickConfig(modulePath);

	if (pickConf === undefined) {
		return;
	}

	console.log("Selected: " + pickConf.name);

	const pickModuleConf = vscode.workspace.getConfiguration('tcd-coder.modules');

    try {
        await pickModuleConf.update(pickModuleId, pickConf.moduleConfiguration, vscode.ConfigurationTarget.Global);
    }
    catch (err) {
        vscode.window.showErrorMessage("Error updating settings for " + pickModuleId);
    }
}
