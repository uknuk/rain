var comp = exports,
    React = require('react'),
    _ = require('lodash'),
    path = require('path'),
    lib = require('./lib.js');


comp.Info = function(props) {
  var state = props.state;
  return (
    <div className="container">
      {
        _.map(props.fields, function(key, n) {
          return <span key={n} className={key}> {(state[key] || '') + ' '} </span>;
        })
       }

      { state.pause ? <span className="glyphicon glyphicon-pause" /> : null }

      <comp.Progress display={!state.sel} played={state.played} length={state.length} />
      <p/>
    </div>
  );
}

comp.Progress = function(props) {
  if (!(props.display && props.played))
    return null;

  return (
    <div className="col-sm-12">
      <div className="col-sm-10">
        <div className="progress">
          <div className="progress-bar"
               style={{
                      width: lib.seconds(props.played)/lib.seconds(props.length)*100 + "%",
                      minWidth: "2em"
                      }}
               >
            {props.played}
          </div>
        </div>
      </div>

      <div className="col-sm-2">
        <span className="length" id="length">{props.length}</span>
      </div>
    </div>
  );
}

comp.Tracks = function(props) {
  var state = props.state;

  if (state.sel || !state.tracks)
    return null;

  return (
    <div>
      {
        _.map(state.tracks, function(track, n) {
          return (
            <comp.Button key={n}
                        type = {n == props.state.trackNum ? "current" : "track"}
                        name={track} limit="50"
                        onClick = {_.partial(props.onClick, n) }
            />
          )
        })
      }
            <p></p>
    </div>
  );
}

comp.Albums = function(props) {
  var state = props.state;

  if (!state.albs || !state.showAlbs || !state.art)
    return null;

  return (
    <div className="albs">
      <p></p>
      {state.selArt + ': '}
      {
        _.map(state.albs, function(alb, n) {
          return (
            <comp.Button key={n}
                        type = {n == state.albNum && !state.sel ? "current" : "alb"}
                        name={alb} limit="40"
                        onClick = {_.partial(props.onClick, alb)}
            />
          )
        })
      }
            <p></p>
    </div>
  );
}

comp.Artists = function(props) {
  if (!props.sel)
    return null;

  return (
    <div>
      {
        _.map(props.arts.sort(), function(art, n) {
          return (
            <comp.Button key={n} type="art"
                        name={art} limit="20"
                        onClick = { _.partial(props.onClick, art)}
            />
          )
        })
      }
    </div>
  );
}

comp.Button = function(props) {
  return (
    <button onClick={props.onClick} className={props.type} >
      {lib.strip(props.name).substring(0, props.limit)}
    </button>
  );
};


comp.Pause = function() {
  return (<span className="glyphicon glyphicon-pause"></span>);
};
