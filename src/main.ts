// ------------------------ main.ts ------------------------
import { App } from './app/App';

const app = new App();
app.init();

// Mount Plugin GUI
const pluginUI = document.createElement('plugin-slot');
document.body.appendChild(pluginUI);
