# How we used NASA data

Delta-V 26 uses NASA's [DONKI space weather database](https://ccmc.gsfc.nasa.gov/tools/DONKI/) to turn recent solar-flare observations into a simple game weather label. The app asks for flare records from the previous three days and uses the strongest flare class: C or lower means calm, M means active, and X means storm. That label can be shown at the start of a game; later turns use the game's own random weather rules. When the live request fails, the app uses clearly labeled sample records. Those samples are not NASA measurements.

- Source: NASA CCMC DONKI's solar-flare (FLR) feed.
- Transformation: flare class to calm, active, or storm.
- Player effect: a starting weather cue for planning; the engine's later weather is simulated.
- Offline behavior: embedded sample data labeled separately from live observations.
