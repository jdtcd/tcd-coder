import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs';

export class AvailableProjectsProvider implements vscode.TreeDataProvider<AvailableProject> {
    getTreeItem(element: AvailableProject): vscode.TreeItem {
        return element;
    }

    getChildren(element?: AvailableProject): Thenable<AvailableProject[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            // return Promise.resolve([
            //     new AvailableProject('repository1'),
            //     new AvailableProject('repository2')
            // ]);
            return Promise.resolve([]);
        }
    }
}

export class AvailableProject extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private uri: string = '',
        public readonly command?: vscode.Command
    ) {
        super(label);
        this.tooltip = `${this.uri}`;
        this.description = 'A short description';
        this.contextValue = 'AvailableProject';
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'folder.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'folder.svg')
    };
}

export class MyProjectsProvider implements vscode.TreeDataProvider<Project> {
    getTreeItem(element: Project): vscode.TreeItem {
        return element;
    }

    getChildren(element?: Project): Thenable<Project[]> {
        if (element === undefined) {
            // Populate project root nodes
            return Promise.resolve([
                // Just some dummy values for testing
                // TODO: Replace with project roots from configuration
                new Project('solution', vscode.Uri.file("/Users/jdukes/Developer/CSU1102x/solution"), true, vscode.TreeItemCollapsibleState.Collapsed),
                new Project('provided', vscode.Uri.file("/Users/jdukes/Developer/CSU1102x/provided"), true, vscode.TreeItemCollapsibleState.Collapsed)
            ]);
        } else if (element.isProjectRoot) {
            // Search for projects under this project root and populate children
            return Promise.resolve(this.findProjects(element?.uri, 1));
        } else {
            // A leaf node - no children
            return Promise.resolve([]);
        }
    }

    private async findProjects(uri: vscode.Uri, maxDepth: number = 1): Promise<Project[]> {

        return vscode.workspace.fs.readDirectory(uri).then(async (files) => {
            let projects: Project[] = [];
            for (const [name, type] of files) {
                if (type === vscode.FileType.Directory) {
                    const projectPath = vscode.Uri.joinPath(uri, name);
                    if (await this.isProjectDirectory(projectPath) === true) {
                        projects.push(new Project(name, projectPath, false, vscode.TreeItemCollapsibleState.None));
                    }
                    if (maxDepth > 1) {
                        projects = projects.concat(await this.findProjects(projectPath, maxDepth - 1));
                    }
                }
            }
            return Promise.resolve(projects);
        });

    }

    private async isProjectDirectory(uri: vscode.Uri): Promise<boolean> {
        return vscode.workspace.fs.readDirectory(uri).then((files) => {
            for (const [name, type] of files) {
                if (type === vscode.FileType.File && name.endsWith('.code-workspace')) {
                    return Promise.resolve(true);
                }
            }
            return Promise.resolve(false);
        });
    }
}

class Project extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly uri: vscode.Uri,
        public readonly isProjectRoot: boolean,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.uri.fsPath}`;
        this.contextValue = isProjectRoot ? 'ProjectRoot' : 'Project';
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'folder-active.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'folder-active.svg')
    };
}