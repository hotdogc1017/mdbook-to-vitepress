#!/usr/bin/env node

import { Command } from 'commander';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MdBookToVitePressConverter } from './migrator.js';
import type { MigrationOptions } from './types.js';

// 获取当前文件的目录路径（ES 模块中的 __dirname 替代方案）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取 package.json 获取版本号
function getVersion(): string {
  try {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version;
  } catch (error) {
    console.warn('无法读取版本信息:', error);
    return '未知版本';
  }
}

const program = new Command();

program
  .name('mdbook-to-vitepress')
  .description('将 mdbook 项目迁移到 VitePress')
  .version(getVersion(), '-v, --version', '显示版本号');

program
  .command('migrate')
  .description('将 mdbook 项目迁移到 VitePress')
  .argument('<target>', '目标 VitePress 项目目录路径')
  .argument('[source]', 'mdbook 项目目录路径', '.')
  .option('-p, --preserve-structure', '保持原始目录结构', false)
  .option('-n, --generate-nav', '生成导航菜单', true)
  .option('-f, --files-only', '仅转换文件，不生成 VitePress 结构', false)
  .action(async (target: string, source: string, options: { preserveStructure: boolean; generateNav: boolean; filesOnly: boolean }) => {
    try {
      const sourcePath = resolve(source);
      const targetPath = resolve(target);

      // 验证源目录
      if (!existsSync(sourcePath)) {
        console.error(`错误：源目录不存在: ${sourcePath}`);
        process.exit(1);
      }

      const bookTomlPath = resolve(sourcePath, 'book.toml');
      if (!existsSync(bookTomlPath)) {
        console.warn(`警告：在 ${sourcePath} 中未找到 book.toml`);
        console.warn('使用默认配置继续...');
      }

      const migrationOptions: MigrationOptions = {
        sourcePath,
        targetPath,
        preserveStructure: options.preserveStructure,
        generateNav: options.generateNav,
        onlyConvertFiles: options.filesOnly
      };

      const converter = new MdBookToVitePressConverter(migrationOptions);
      await converter.migrate();

      if (options.filesOnly) {
        console.log('\n✅ 文件转换完成！');
        console.log('\n转换后的文件位于:', targetPath);
      } else {
        console.log('\n✅ 迁移成功完成！');
        console.log('\n下一步操作：');
        console.log(`1. cd ${targetPath}`);
        console.log('2. npm install');
        console.log('3. npm run docs:dev');
      }

    } catch (error) {
      console.error('❌ 迁移失败：', error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('初始化一个新的 VitePress 项目')
  .argument('<target>', '目标目录路径')
  .action(async (target: string) => {
    console.log(`正在 ${target} 中初始化 VitePress 项目...`);
    // 这里可以扩展为创建一个空白的 VitePress 项目
    console.log('使用 migrate 命令从 mdbook 转换');
  });

program.parse();