To run both the web server and the analytics-server use the following command in the terminal from the directory where the docker-compose.yml file is located:

docker compose up --build

To shut down both servers press CTRL + C in the terminal window

The web server can then be accessed at http://localhost:3000
There is only one page and it accepts a URL parameter, as such:
http://localhost:3000/?goal=Break+100
or
http://localhost:3000/?goal=Break+Par

The analytics server tracks Page View and Full video watch events.
To view the log file go to http://localhost:4000/analytics
To download the file go to http://localhost:4000/analytics/download and the browser will download the events.log file
