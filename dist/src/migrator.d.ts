import type { MigrationOptions } from "./types.js";
export declare class MdBookToVitePressConverter {
    private options;
    private parser;
    private syntaxConverter;
    constructor(options: MigrationOptions);
    migrate(): Promise<void>;
    private createTargetStructure;
    private createDefaultHomePage;
    private copyMarkdownFiles;
    private copyFilesRecursively;
    private isStaticAsset;
    private isDocumentFile;
    private generateVitePressConfig;
    private generateSidebar;
    private generateNav;
    private extractTitleFromFile;
    private generateConfigFile;
    private formatConfigObject;
    private createVitePressPackageJson;
    private convertFilesOnly;
    private processDirectory;
    private convertMarkdownFile;
}
//# sourceMappingURL=migrator.d.ts.map