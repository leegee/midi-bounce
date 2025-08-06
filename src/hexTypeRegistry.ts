import type { HexTypeId, HexTypeStyle } from "./HexCell";

export const hexTypeRegistry = new Map<HexTypeId, HexTypeStyle>();

hexTypeRegistry.set("default", {
    name: "Default",
    edgeColors: ["red", "orange", "yellow", "green", "blue", "purple"],
    edgeNotes: [36, 38, 36, 38, 36, 38],
    fillColor: "#222",
});

hexTypeRegistry.set("fire", {
    name: "Fire",
    edgeColors: ['#ff4500', '#ff6347', '#ff7f50', '#ffa07a', '#ff8c00', '#ffdab9'],
    edgeNotes: [36, 37, 37, 37, 37, 37],
    fillColor: '#330000',
});

export function registerHexType(typeId: HexTypeId, style: HexTypeStyle) {
    hexTypeRegistry.set(typeId, style);
}
