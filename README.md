# midi-bounce

Experiments with Web MIDI API - bouncing a ball inside a honeycomb.

Remember loopMIDI is very useful in this scenario.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun dev
```

This project was created using `bun init` in bun v1.1.32. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## To DO

Walls of different materials could have properties akin to those used in Web GL to sepcify the properties of interaction with light. Each property would have an effect on the interaction of the wall with the world/the ball/s: low roughness = bouncyness = add to velocity; high roughness = absorbs some of the ball's energy, decreasing velocity.

Currently hard-coded to find the loopMIDI device, should expose that or incorporate the device chooser from MIDI  Feather.
