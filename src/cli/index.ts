#!/usr/bin/env node

import { Command } from "commander";
import pkg from "~/package.json";
import { migrate } from "./migrate";

const program = new Command();
program
  .name("mdbook-to-vitepress")
  .description("mdBook to VitePress converter")
  .option(
    "-i, --including-files-dir <DIR>",
    "Including files directory, which based on the mdbook project directory",
  )
  .version(pkg.version, "-v, --version", "show version")
  .argument("<target>", "The vitepress project directory path")
  .argument(
    "[source]",
    "The mdbook project directory path, default is current directory",
    "",
  )
  .action(migrate);

program.parse();
