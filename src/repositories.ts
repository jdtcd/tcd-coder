import * as path from 'path';
import * as vscode from 'vscode';

export class AvailableRepositoriesProvider implements vscode.TreeDataProvider<AvailableRepository> {
    getTreeItem(element: AvailableRepository): vscode.TreeItem {
        return element;
    }

    getChildren(element?: AvailableRepository): Thenable<AvailableRepository[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            // return Promise.resolve([
            //     new AvailableRepository('repository1'),
            //     new AvailableRepository('repository2')
            // ]);
            return Promise.resolve([]);
        }
    }
}

export class AvailableRepository extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private uri: string = '',
        public readonly command?: vscode.Command
    ) {
        super(label);
        this.tooltip = `${this.uri}`;
        this.description = 'A short description';
        this.contextValue = 'availableRepository';
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'folder.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'folder.svg')
    };
}

export class ClonedRepositoriesProvider implements vscode.TreeDataProvider<ClonedRepository> {
    getTreeItem(element: ClonedRepository): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ClonedRepository): Thenable<ClonedRepository[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            return Promise.resolve([
                new ClonedRepository('repository1'),
                new ClonedRepository('repository2')
            ]);
        }
    }
}

class ClonedRepository extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        private uri: string = ''
    ) {
        super(label);
        this.tooltip = `${this.uri}`;
        this.description = 'A short description';
        this.contextValue = 'clonedRepository';
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'folder-active.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'folder-active.svg')
    };
}