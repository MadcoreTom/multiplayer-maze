# Level format
* 0-9 and A-F are player IDs, limiting at 6 players
* `#` is wall
* `.` is floor

# Player format
* ID (hex)
* paint colour (from server)
* position (XY)
* delta (XY)
* score

# State
State could share a common typedef between clientstate and serverstate

# Game modifier ideas
randomizes game mode before next starts (client just shows random ones until server picks)

* mega-maze - much less joins in the maze (or none?)
* paint buckets  - you need to pick up paint
* can't cross enemy paint
* slow on enemy paint
* little AI erasers