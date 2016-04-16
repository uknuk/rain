var React = require('react'),
     fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    lib = require('./lib.jsx');


module.exports = React.createClass({
  displayName: 'Albums',
  getInitialState: function() {
    return {
      artist: null,
      shown: null,
      played: null,
    };
  },
  componentWillMount: function() {
    if (this.props.artist)
    	this.load();
  },

  componentWillUpdate: function() {
    if (this.props.artist != this.state.artist)
      this.load();
  },            
    
  render: function() {
    var art = this.props.artist,
        self = this;
    //console.log(this.state);
    if (!this.state.shown)
      return null;
    
    return (
      <div style={{color: 'blue'}}>
        {path.basename(art) + ':'}
        {
          _.map(this.state.shown, function(alb, n) {
            var val = path.join(art, alb);
            return (
              <lib.Button
              key={n}
              color="green"
							name={alb} limit="40"
              fun={_.partial(self.playAlbum, val)}
              />
            )
          })
         }
      </div>
    );
  },

  sort: function(albums) {
    return  _.sortBy(albums, function(alb) {
	    var year, added, re = /^\d{2}[\s|_|-]/;
	    if (alb.substr(0,2) == 'M0')
	      return alb.replace('M0', '200');
	    year = alb.match(re);
	    if (year) {
	      added = year[0].substr(0,2) < 30 ? '20' + alb : '19' + alb;
	      return added;
	    }
	    // works until 2030 
	    return alb;
    });
  },
  
  playAlbum: function(alb) {
    if (fs.statSync(alb).isFile())
	  	this.play([alb]);
  	else
    	this.play(fs.readdirSync(alb), alb);

    this.setState({
      played: this.state.shown
    });
    
    this.props.update({showArtists: false})
  },
  
  play: function(files, alb) {
    var ext = /\.mp3$|\.mp4a$|\.mpc$|\.ogg$/,
        tracks = _.filter(files, function(file) {
	        return ext.test(file);
        });
 	  
    _.reduce(tracks, function(prom, track, n) {
	    return prom.then(function() {
	      var cmd = "audtool playlist-addurl \"";
        if (alb)
		      cmd += alb + "/";
        cmd +=  track + "\"";
	      //show_track(n, track);
	      if (n == tracks.length - 1)
		      cmd += "; audtool playback-play";
	      return lib.execAsync(cmd);
	    }).catch(function(err) {
	      console.log(err);
	    });		  
    }, lib.execAsync('audtool playlist-clear'));      
  },

  load: function() {
  	var state = {},
        art = this.props.artist,
        albs = this.sort(fs.readdirSync(art)),
				nodirs = _.every(albs, function(alb) {
          return fs.statSync(path.join(art, alb)).isFile()
        });
    	  // check if albs has at least one directory(album)

    state = {
      artist: art,
      shown: albs
    };

    if (this.props.played)
      state.played = albs;

    this.setState(state);
    
		if (nodirs) {
	    this.playAlbum(art);
      return;
    }
   
    if (albs.length == 1)
      this.playAlbum(path.join(art, albs[0]))
  }    
  
});
                    
      		
      	
