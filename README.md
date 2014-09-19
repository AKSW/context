# conTEXT

Based on [Powder.js](https://github.com/yamalight/generator-powder)

### Requirements

Latest Node.js + NPM  
Latest MongoDB
Latest Elasticsearch (http://www.elasticsearch.org)
Bower (get by running "npm install -g bower")  
Gulp (get by running "npm install -g gulp")

### Installing

Clone & do "npm install"  
Change config.js to your needs  

### Running
Run elasticsearch
For debugging just run "gulp"  
For release run "gulp build" to compile js and css and then run "npm start" (or "./bin/context")  

### TODO: integrate elasticsearch in vagrant and docker

### Running via Vagrant

Assuming you have [vagrant](http://www.vagrantup.com/) installed, you can run conTEXT with few simple commands:  

1. Execute `vagrant up` to init & start vagrant environment
2. Once ready, connect to vagrant box using `vagrant ssh`
3. Change to workdir with `cd /vagrant`
4. (optional) Install conTEXT with `npm install`
5. Run the app with `gulp`
7. Open vagrant host on port 8080 in browser and see conTEXT running

### Runnin via Docker

Assuming you have [docker](https://www.docker.io/) installed, you can run conTEXT with few simple commands:  

1. Get MongoDB running either on docker host machine or in separate docker container.
2. (Optional) If you wish to run MongoDB in a separate docker container first pull it using `docker pull dockerfile/mongodb`.  
Then run it as a daemon with persistent local folder using:  
`docker run -d --name mongodb -v /data/db:/data/db dockerfile/mongodb`.  
You will as well need to replace the database connection line in config.js with following:  
`exports.db = 'mongodb://' + process.env.MONGODB_PORT_28017_TCP_ADDR + '/context';`
3. Execute `docker build -t context .` to build new docker image
4. Once ready, start up the docker container using `docker run -d -p 8080:8080 context` (you will need to add `--link mongodb:mongodb` if you want to link it with your MongoDB container)
7. Open docker host on port 8080 in browser and see conTEXT running

### Testing

Run "npm test"  

### License

MIT
