# bloodSugarSimulation

Make sure you have Postman Chrome extension/app.

Make sure you have node, npm, and postgres installed. 

* Make sure postgres is running on port 5432 (`postgres -p 5432 -D /usr/local/var/postgres`, or depending on where your postgres is installed on your computer)

* Run `npm install` to make sure you have all the node packages

* Run `psql -f bloodSugarActivity.sql` to get the database created

* Run `npm start` to start the server

* In Postman, to add food/exercise activity, POST to localhost:3000/api/bloodSugar. Headers is `Content-Type application/json`. In the body:
`{
  "type": "food",
  "type_id": 3,
  "time_stamp": "2016-10-29T20:00:00.000Z"
}`

`type` can be either "food" or "exercise", `type_id` correlates with the id of the food/activity in the food/exercise dictionary. 

* To get blood sugar readings, GET to localhost:3000/api/bloodSugar. It will return a JSON object containing `results`, that are blood sugar
calculations based on activity input, and a `totalGlycation` field, indicating amount of glycation so far. 

We are getting and calculating blood sugar based on activity inputs that have happened so far in the current day.
The results show rise and fall of blood sugar starting at the time of the first activity in the day, and the blood sugar at the one hour mark for both
food and exercise, and two hour mark for food. If the last timestamp in the results for the day corresponds to a blood sugar above 80, we also show time
and blood sugar level for each hour until blood sugar goes back to 80. 

