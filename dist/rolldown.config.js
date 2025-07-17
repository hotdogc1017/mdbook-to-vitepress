import { defineConfig } from 'rolldown';
export default defineConfig({
    input: 'src/cli.ts',
    external: ["commander", "yaml", "fs-extra"]
});
//# sourceMappingURL=rolldown.config.js.map