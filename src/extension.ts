// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { AvailableRepositoriesProvider, AvailableRepository } from './repositories';
import { ClonedRepositoriesProvider } from './repositories';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "tcd-coder" is now active!');
	
	const clonedRepositoriesProvider = new ClonedRepositoriesProvider();
	vscode.window.registerTreeDataProvider('clonedRepositories', clonedRepositoriesProvider);

	const availableRepositoriesProvider = new AvailableRepositoriesProvider();
	vscode.window.registerTreeDataProvider('availableRepositories', availableRepositoriesProvider);

	vscode.commands.registerCommand('availableRepositories.clone', () => 
		vscode.window.showInformationMessage('Will clone the repository')
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
