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
        if (element?.label === 'folder1') {
            return Promise.resolve(this.findProjects(vscode.Uri.file("/Users/jdukes/Developer/CSU1102x/solution"), 1));
        } else if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve([
                new Project('folder1', '', vscode.TreeItemCollapsibleState.Collapsed),
                new Project('folder2', '', vscode.TreeItemCollapsibleState.Collapsed)
            ]);
        }
    }

    private async findProjects(uri: vscode.Uri, maxDepth: number = 1): Promise<Project[]> {

        return vscode.workspace.fs.readDirectory(uri).then(async (files) => {
            let projects: Project[] = [];
            for (const [name, type] of files) {
                if (type === vscode.FileType.Directory) {
                    if (await this.isProjectDirectory(vscode.Uri.joinPath(uri, name)) === true) {
                        projects.push(new Project(name, uri.fsPath, vscode.TreeItemCollapsibleState.None));
                    }
                    if (maxDepth > 1) {
                        projects = projects.concat(await this.findProjects(vscode.Uri.joinPath(uri, name), maxDepth - 1));
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
        private uri: string = '',
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.uri}`;
        this.contextValue = 'Project';
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'folder-active.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'folder-active.svg')
    };
}