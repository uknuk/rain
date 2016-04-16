var React = require('react'),
    Player = require('./player.jsx'),
    Albums = require('./albums.jsx'),
    Typeahead = require('react-typeahead').Typeahead;
    fs = require('fs'),
    _ = require('lodash'),
    path = require('path'),
    lib = require('./lib.jsx');

module.exports = React.createClass({
  displayName: 'Main',
  getInitialState: function() {
    var buf =  fs.readFileSync(path.join(process.env['HOME'],'.nwaud'), 'utf8');
    return {
    	artist: null,
      album: null,
      track: null,
      tracks: null,
      artists: {},
      showArtists: false,
      showSearch: false,
      roots: buf.replace(/\n+/,'').split(/\s+/)
      };
  },
  componentDidMount: function() {
    window.addEventListener("keypress", this.keyhandler, false);
    this.getArtists();   
  },


  componentDidUpdate: function() {
    if (this.refs.search)
      this.refs.search.focus();
  },
       
  render: function() {
    return (
      <div>
        <Player data={_.clone(this.state)} update={this.update}  />
        { this.renderTracks() }
        <Albums artist={this.state.artists[this.state.artist]}
                update={this.update} played={!this.showArtist}
        />
        { this.state.showArtists ? this.renderArtists() : null }
        {
          this.state.showSearch ? (
            <Typeahead ref="search"
            options={_.keys(this.state.artists)}
            onOptionSelected={this.selected}
            filterOption={this.match}
            value=""
            />
          ) : null
         }           
      </div>
    );
  },

  renderArtists: function() {
    var self = this;
    if (this.state.showArtists) {
      return _.map(_.keys(this.state.artists).sort(), function(art, n) {
        return (
          <lib.Button key={n}
						          color="blue"
						          name={art} limit="20"
						          fun={_.partial(self.update, {artist: art}) }
          />
        );
      });
    }
  },

  renderTracks: function() {
    if (this.state.showArtists || !this.state.tracks)
      return null;

    return _.map(this.state.tracks, _.bind(function(track, n) {
    	return (
      	<lib.Button key={n}
			              color="red"
                    name={track} limit="50"
                    fun={_.partial(this.playTrack, n + 1)}
      	/>
      );
    }, this));
  },
     
  keyhandler: function(e) {
    if (e.ctrlKey) {
      switch(String.fromCharCode(96 + e.which)) {
        case 'w':
          if (this.state.showArtists)
            this.update({showArtists: false, artist: null});
          else {
            this.getArtists();
            this.update({showArtists: true});
          }
          break;
        case 'z':
          this.update({showSearch: !this.state.showSearch});
      };
    }
  },    

  getArtists: function() {
    var arts = _.clone(this.state.artists);
    // add only new keys 
    _.each(this.state.roots, function(dir, n) {
	    if (dir.length > 0)
	      _.each(fs.readdirSync(dir), function(name) {
	        arts[name] = path.join(dir, name) 
	      });
    });
    this.setState({artists: arts});
  },

  playTrack: function(num) {
    lib.audtool('playlist-jump ' + num);
  },
    
  update: function(state) {
    this.setState(state);
  },

  selected: function(opt) {
    this.setState({artist: opt});
  },

  match(input, opt) {
    return _.startsWith(_.toLower(opt), _.toLower(input));
  },
  
});
  
