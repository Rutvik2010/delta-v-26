# How we used NASA data

Delta-V 26 uses real solar flare records from NASA's DONKI database (ccmc.gsfc.nasa.gov/DONKI, solar flare feed). We saved two real datasets in the repo: the strongest flare of each day from 1 to 30 May 2024, and the strongest flare of each day for the last 30 days (15 October to 13 November 2026). The player chooses one on the briefing screen.

Each sol in the game uses one real day. The flare class sets the weather: C or smaller is calm, M is active, X is storm. A stormier month also makes the game's solar events hit harder. The game forecast shows the coming weather.

The data/space_weather_fallback.json file is made-up sample data for offline use. It is labelled as sample data and is not NASA data. We did not use any other NASA dataset. This project is built for NASA Space Apps 2026 and is not endorsed by NASA.
