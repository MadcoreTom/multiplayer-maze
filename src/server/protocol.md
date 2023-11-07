# Protocol

States
* winner/generate
* play

So the server creates the maze

every `x` ms the server sends a message to the clients

* if its a new map, they get a serialised version of the map
* if they've just joined, they get a serialised version of the map

updates are accumulated between game loops
* current player positions are updated
* paint updates  are put in  a list, send and flushed each gamee loop

At the end of the round, the painted tiles from the serverside are added up and the winner is sent

## outstanding

* where do player names come from
* what is the format in arr `width,height,(solid|paintId)[]`
    * it needs to be serialisable/deserialisable