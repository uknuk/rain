var lib = exports,
		cproc = require('child_process'),
    path = require('path'),
    fs = require('fs'),
    path = require('path'),
    ext = /\.mp3$|\.mp4a$|\.mpc$|\.ogg$/;
    React = require('react');
    
lib.exec = function(cmd) {
  try {
    return cproc.execSync(cmd).toString();
  }
  catch (err) {
    return null;
  }
};

lib.audtool = function(cmd) {
    return this.exec('audtool ' + cmd);
};

lib.current = function() {
  var cmd = '%filename %length %output-length %bitrate-kbps'
      .replace(/%/g, 'current-song-');
  return this.audtool(cmd).split(/\n/);
};


lib.fill = function(state, key, rest) {
  var name = path.basename(rest),
  		keys = key + 's';

  rest = path.dirname(rest);

  if (state[key] != name && !state.sel && !state.search) {
    if (key != 'art') {
      // album is file
			if (key == 'track' && _.includes(_.values(state.arts), dir))
    		return rest;

      if (!state[keys] &&  !state.sel && !state.search)
    		state[keys] = fs.readdirSync(rest);

   		state[key + 'Num'] = _.indexOf(state[keys], name);
    }
    state[key] = name;
  }
  return rest;
}
    
lib.load = function() {
  var buf = fs.readFileSync(path.join(process.env['HOME'],'.nwaud'), 'utf8'),
      roots = buf.replace(/\n+/,'').split(/\s+/);

  return function() {
    var arts = {};
    // add only new keys 
    _.each(roots, function(dir, n) {
      if (dir.length > 0)
        _.each(fs.readdirSync(dir), function(name) {
          arts[name] = path.join(dir, name) 
        });   
    });
    return arts;
  };
}();

lib.play = function(files, alb) {
  var tracks = _.filter(files, function(file) {
    return ext.test(file);
  });

  lib.audtool('playlist-clear'); 
  
  _.each(tracks, function(track) {
    var cmd = "playlist-addurl \"";
    if (alb)
      cmd += alb + "/";
    cmd += track + "\"";
    lib.audtool(cmd);
  });
  
  lib.audtool('playback-play');   
};


lib.Info = function(props) {
  return _.map(props.fields, function(key, n) {
    return (
      <span key={n} className={key}>
        {(props.state[key] || '') + ' '}
      </span>
    );
  });
}

lib.Tracks = function(props) {
  var state = props.state;
  
  if (state.sel || !state.tracks)
    return null;

  return _.map(state.tracks, function(track, n) {
    return (
      <lib.Button key={n}
			            type = {n == props.state.trackNum ? "current" : "track"}
                  name={track} limit="50"
                  fun={function(n) { lib.audtool('playlist-jump ' + (n + 1)) }}
      />
    );
  });
}

lib.Albums = function(props) {
  var state = props.state;
  
  if (!state.albs)
    return null;
  
  return (
    <div className="albs">
      <p></p>
      {path.basename(state.art) + ': '}
      {
        _.map(state.albs, function(alb, n) {
          var val = path.join(state.art, alb);
          return (
            <lib.Button key={n} 
            type = {n == state.albNum ? "current" : "alb"}
						name={alb} limit="40"
            fun={_.partial(props.onClick, val)}
            />
          )
        })
       }
            <p></p>
    </div>
  );
}

lib.Artists = function(props) {
  if (!props.state.sel)
    return null;

  return _.map(_.keys(props.state.arts).sort(), function(art, n) {
    return (
      <lib.Button key={n} type="art"
						      name={art} limit="20"
						      fun={ _.partial(props.onClick, art)}
      />
    );
  });
}
    
    
lib.Button = function(props) {
  return (
    <button onClick={props.onClick} className={props.type} >
      {props.name.replace(path.extname(props.name),'').substring(0, props.limit)}
    </button>
  );
};

      

    
