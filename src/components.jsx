var comp = exports,
    React = require('react'),
    _ = require('lodash'),
    path = require('path'),
    lib = require('./lib.js');


comp.Info = function(props) {
  return (
    <div>
      {
        _.map(props.fields, function(key, n) {
          return (
            <span key={n} className={key}>
              {(props.state[key] || '') + ' '}
            </span>
          )
        })
      }
            <p></p>
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
      {state.art + ': '}
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
