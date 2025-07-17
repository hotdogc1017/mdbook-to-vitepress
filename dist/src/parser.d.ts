import type { MdBookConfig } from './types.js';
export declare class MdBookParser {
    private sourcePath;
    constructor(sourcePath: string);
    parseConfig(): MdBookConfig | null;
    parseSummary(): {
        title: string;
        link: string;
        level: number;
        items?: any[];
    }[];
    private getDefaultConfig;
    private extractChaptersWithStructure;
}
//# sourceMappingURL=parser.d.ts.map