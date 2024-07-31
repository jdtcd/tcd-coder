import * as vscode from 'vscode';
import * as fs from 'fs';

export function checkWinUncFolder() {

	if (process.platform !== 'win32') {
		return;
	}

	if (vscode.workspace.workspaceFolders === undefined) {
		return;
	}
	
	if (vscode.workspace.workspaceFolders.length === 0)
	{
		return;
	}

	const folder = vscode.workspace.workspaceFolders[0];
	console.log("Checking folder: " + folder.uri.fsPath);

	const regex = new RegExp("^\\\\\\\\tholosug\\.(?:itserv\\.)?scss\\.tcd\\.ie\\\\ugrad\\\\[a-zA-Z0-9_]+\\\\", "i");
	if (regex.test(folder.uri.fsPath)) {
		console.log("UNC path detected.");
		const fixPath = folder.uri.fsPath.replace(regex, 'U:\\');
		let fixAvailable = false;
		try {
			fs.accessSync(fixPath);
			fixAvailable = true;
		}
		catch (err) {
			fixAvailable = false;
		}
		if (fixAvailable) {
			console.log("Fix path available.");
			vscode.window
				.showErrorMessage(
					"Network (UNC) paths are not supported for CSU11021/CSU11022. " +
					"Close this window and re-open the project from a mapped network drive (e.g. your U: drive). " +
					"Would you like to try to do this automatically?",
					"Yes", "No")
				.then(answer => {
					if (answer === "Yes") {
						const fixUri = vscode.Uri.file(fixPath);
						vscode.commands.executeCommand('vscode.openFolder', fixUri);
					}
				});
		}
		else {
			console.log("Fix path not available.");
			vscode.window.showErrorMessage(
				"Network (UNC) paths are not supported by CSU11021/CSU11022.\n" +
				"Close this window and re-open the project from a mapped network drive (e.g. your U: drive).");
		}
	}
	else {
		console.log("Not a UNC path.");
	}
}