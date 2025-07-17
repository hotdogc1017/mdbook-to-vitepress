export interface MdBookConfig {
    book: {
        title: string;
        description?: string;
        authors?: string[];
        language?: string;
        multilingual?: boolean;
        src?: string;
    };
    build?: {
        build_dir?: string;
        create_missing?: boolean;
    };
    preprocessor?: Record<string, any>;
    output?: Record<string, any>;
}
export interface VitePressConfig {
    title: string;
    description?: string;
    lang?: string;
    base?: string;
    markdown?: {
        math?: boolean;
        [key: string]: any;
    };
    themeConfig: {
        nav?: NavItem[];
        sidebar?: SidebarItem[] | Record<string, SidebarItem[]>;
    };
}
export interface NavItem {
    text: string;
    link?: string;
    items?: NavItem[];
}
export interface SidebarItem {
    text: string;
    link?: string;
    items?: SidebarItem[];
    collapsed?: boolean;
}
export interface MigrationOptions {
    sourcePath: string;
    targetPath: string;
    preserveStructure?: boolean;
    generateNav?: boolean;
    onlyConvertFiles?: boolean;
}
//# sourceMappingURL=types.d.ts.map