# conTEXT: ReSA (Real-time Semantic Analysis)

Based on [Powder.js](https://github.com/yamalight/generator-powder)

### Requirements

Latest Node.js + NPM  
Latest MongoDB  
Bower (get by running "npm install -g bower")  
Gulp (if you want to run "gulp" from CLI, not from npm)  

### Installing

Clone & do "npm install"  

### Running

For debugging just run "gulp" or "gulp | bunyan"
For release run "gulp build" to compile js and css and then run "npm start" (or "./bin/context")
Then you need to go to '/resa' to see the real-time twitter analysis

### Running via Vagrant

Assuming you have [vagrant](http://www.vagrantup.com/) installed, you can run conTEXT with few simple commands:  

1. Execute `vagrant up` to init & start vagrant environment
2. Once ready, connect to vagrant box using `vagrant ssh`
3. Change to workdir with `cd /vagrant`
4. (optional) Install conTEXT with `npm install`
5. Run the app with `gulp`

### Testing

Run "npm test"  
