// MdBook 配置接口
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

// VitePress 配置接口
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

// 导航项接口
export interface NavItem {
  text: string;
  link?: string;
  items?: NavItem[];
}

// 侧边栏项接口
export interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
}

// 迁移选项接口
export interface MigrationOptions {
  sourcePath: string;
  targetPath: string;
  preserveStructure?: boolean;
  generateNav?: boolean;
  onlyConvertFiles?: boolean; // 仅转换文件，不生成 VitePress 结构
}