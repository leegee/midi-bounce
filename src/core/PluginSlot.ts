// ------------------------ components/PluginSlot.ts ------------------------
import { LitElement, html, css } from 'lit';

declare global {
    interface HTMLElementTagNameMap {
        'plugin-slot': PluginSlot;
    }
}

export class PluginSlot extends LitElement {
    static styles = css`
        :host {
            display: block;
            border: 1px solid #ccc;
            padding: 1rem;
            margin: 0.5rem;
        }
    `;

    render() {
        return html`<slot></slot>`;
    }
}

customElements.define('plugin-slot', PluginSlot);
