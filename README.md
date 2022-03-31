# API server for RoboRally Java Game Agile course.
| Endpoint                                   | Response | 
| -------------------------------------------| ---------|
| ``POST /createUser/[username]``            | Success message if user has been created, error message if user already exists. | 
|``PUT /chooseRobot/[username]/[robot_name]``| Success message if the robot has been assigned to the user. | 
|``POST /createRoom/[username]/[map_name]``  | Success message with code of the new rooml. | 
|``PUT /joinRoom/[username]/[room_number]``  | Success message if the room has been assigned to the user. |
|``GET /getRoomInfo/[room_number]``          | List of players in room *room_number*
|``DELETE /room/[room_number]``              | Deletes room *room_number*



## TODO 
> - Player exit room
