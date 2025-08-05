// ------------------------ main.ts ------------------------
import { App } from './app/App';
import type { PluginSlot } from './core/PluginSlot';

const app = new App();
app.init();

// Mount Plugin GUI
const pluginUI = document.createElement('plugin-slot') as PluginSlot;
document.body.appendChild(pluginUI);
