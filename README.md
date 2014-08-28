# conTEXT

Based on [Powder.js](https://github.com/yamalight/generator-powder)

### Requirements

Latest Node.js + NPM  
Latest MongoDB  
Bower (get by running "npm install -g bower")  
Gulp (get by running "npm install -g gulp")  

### Installing

Clone & do "npm install"  
Change config.js to your needs  

### Running

For debugging just run "gulp"  
For release run "gulp build" to compile js and css and then run "npm start" (or "./bin/context")  

### Running via Vagrant

Assuming you have [vagrant](http://www.vagrantup.com/) installed, you can run conTEXT with few simple commands:  

1. Execute `vagrant up` to init & start vagrant environment
2. Once ready, connect to vagrant box using `vagrant ssh`
3. Change to workdir with `cd /vagrant`
4. (optional) Install conTEXT with `npm install`
5. Run the app with `gulp`

### Testing

Run "npm test"  

### License

MIT
