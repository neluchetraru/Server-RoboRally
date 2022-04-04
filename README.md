# API server for RoboRally Java Game Agile course.
| User Endpoints                                   | Description |  Response | 
| -------------------------------------------| ---------| --- | 
| ``POST /createUser/[username]``            | Creates a user | ``status 400`` - user already exists <br> ``status 200`` - user created successfully |
|``PUT /chooseRobot/[username]/[robot_name]``| Assigns user a robot | ``status 404`` - user not found <br> ``status 200`` - robot chosen successfully | 
|``PUT /joinRoom/[username]/[room_number]``  | User joins a room | ``status 404`` - user not found <br> ``status 200`` - user joins a room successfully <br> ``status 400`` - room does not exist | 
| ``PUT /exitRoom/[username]``| User exits a room | ``status 404`` - user not found <br> ``status 401`` - user is not currently in any room <br> ``status 200`` - user exits room => response body contains code of the room user has exited |


| Room Endpoints | Description | Response | 
| --- | --- |  --- |
|``POST /createRoom/[username]/[map_name]``  | Creates a room | ``status 200`` - room created successfuly => response body contains code of the new room <br> ``status 404`` - user not found|
|``GET /roomInfo/[room_number]``          | List of players in a room | ``status 404`` - room not found <br>  ``status 200`` - response body contains the list of players in the room and the time room was created | 
|``DELETE /deleteRoom/[room_number]``              | Deletes a room |  ``status 404`` - room not found <br> ``status 200`` - deletes the room|


| Robot Endpoints | Description | Response | 
| --- | --- | ---|
| ``PUT /updateRobotPosition/[username]/[pos_x]/[pos_y]`` | Updates robot position | ``status 200`` - robot position has been updated <br> ``status 404`` - user not found <br> ``status 401`` - user does not have any robot | 
| ``PUT /updateRobotDirection/[user]/[direction]`` | Updates robot direction | ``status 200`` - robot direction has been updated <br> ``status 404`` - user not found <br> ``status 401`` - user does not have any robot | 
| ``GET /getRobotInfo/[username]`` | Get coordinates of users's robot | ``status 200`` - response body contains coordinates x, y and direction of the robot<br> ``status 401`` - user does not have any robot <br> ``status 404`` - user not found |