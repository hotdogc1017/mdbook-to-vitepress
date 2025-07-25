#!/usr/bin/env node

import { Command } from "commander";
import pkg from "~/package.json";
import { migrate } from "./migrate";

const program = new Command();
program
  .name("mdbook-to-vitepress")
  .description("mdBook to VitePress converter")
  .version(pkg.version, "-v, --version", "show version")
  .argument(
    "[source]",
    "The mdbook project directory path, default is current directory",
    ".",
  )
  .argument("<target>", "The vitepress project directory path")
  .action(migrate);

program.parse();
