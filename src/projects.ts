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
            return this.findProjects(element?.uri, 2).then((projects) => {
                return Promise.resolve(projects.sort((a, b) => a.label.localeCompare(b.label)));
            });
        } else {
            // A leaf node - no children
            return Promise.resolve([]);
        }
    }

    // private async findProjects(uri: vscode.Uri, maxDepth: number = 0): Promise<Project[]> {

    //     const files = await vscode.workspace.fs.readDirectory(uri);
    //     let projects: Project[] = [];
    //     for (const [name, type] of files) {
    //         if (type === vscode.FileType.Directory) {
    //             const projectPath = vscode.Uri.joinPath(uri, name);
    //             if (await this.isProjectDirectory(projectPath) === true) {
    //                 projects.push(new Project(name, projectPath, false, vscode.TreeItemCollapsibleState.None));
    //             }
    //             if (maxDepth > 0) {
    //                 projects = projects.concat(await this.findProjects(projectPath, maxDepth - 1));
    //             }
    //         }
    //     }
    //     return projects;
    // }

    private async findProjects(uri: vscode.Uri, maxDepth: number = 0): Promise<Project[]> {

        return vscode.workspace.fs.readDirectory(uri).then((files) => {
            let projects: Project[] = [];
            let promises: Promise<any>[] = [];
            for (const [name, type] of files) {
                if (type === vscode.FileType.Directory) {
                    const projectPath = vscode.Uri.joinPath(uri, name);
                    promises.push(this.isProjectDirectory(projectPath).then((isProject) => {
                        if (isProject === true) {
                            projects.push(new Project(name, projectPath, false, vscode.TreeItemCollapsibleState.None));
                        }
                    }));
                    if (maxDepth > 0) {
                        promises.push(this.findProjects(projectPath, maxDepth - 1).then((subprojects) => {
                            projects.push(...subprojects);
                        }));
                    }
                }
            }
            return Promise.all(promises).then(() => {
                return projects;
            });
        });
    }    

    private async isProjectDirectory(uri: vscode.Uri): Promise<boolean> {
        return vscode.workspace.fs.readDirectory(uri).then((files) => {
            for (const [name, type] of files) {
                if (type === vscode.FileType.File && name.endsWith('.code-workspace')) {
                    return true;
                }
            }
            return false;
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