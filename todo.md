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