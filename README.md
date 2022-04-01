# API server for RoboRally Java Game Agile course.
| User Endpoints                                   | Description |  Response | 
| -------------------------------------------| ---------| --- | 
| ``POST /createUser/[username]``            | Creates a user | ``status 400`` - user already exists <br> ``status 200`` - user created successfully |
|``PUT /chooseRobot/[username]/[robot_name]``| Assigns user a robot | ``status 404`` - user not found <br> ``status 200`` - robot chosen successfully | 
|``PUT /joinRoom/[username]/[room_number]``  | User joins a room | ``status 404`` - user not found <br> ``status 200`` - user joins a room successfully <br> ``status 400`` - room does not exist | 
| ``PATCH /exitRoom/[username]``| User exits a room | ``status 404`` - user not found <br> ``status 401`` - user is not currently in any room <br> ``status 200`` - user exits room => response body contains code of the room user has exited |


| Room Endpoints | Description | Response | 
| --- | --- |  --- |
|``POST /createRoom/[username]/[map_name]``  | Creates a room | ``status 200`` - room created successfuly => response body contains code of the new room  <br> ``status 404`` - user not found|
|``GET /roomInfo/[room_number]``          | List of players in a room | ``status 404`` - room not found <br>  ``status 200`` - response body contains the list of players in the room | 
|``DELETE /deleteRoom/[room_number]``              | Deletes a room |  ``status 404`` - room not found <br> ``status 200`` - deletes the room|


## TODO 
> - Update robot position
> - Get robot position

