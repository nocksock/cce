import { esbuildPlugin } from '@web/dev-server-esbuild';
export default {
  concurrency: 10,
  nodeResolve: true,
  watch: true,
  // in a monorepo you need to set set the root dir to resolve modules
  // rootDir: '../../',
  plugins: [esbuildPlugin({ ts: true, target: 'auto' })],
};
