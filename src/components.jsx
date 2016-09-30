var comp = exports,
    React = require('react'),
    _ = require('lodash'),
    path = require('path'),
    lib = require('./lib.js');

comp.Info = function(props) {
  if (!props.display)
    return null;
  else {
    let state = props.state,
        chars = _.sumBy(props.fields, (f) => state[f].length),
        style = state.track.length > 60 ? {fontSize: '2vw'} : {};
        // make dynamic from length + played

    return (
      <div className="container">
        <div className="info">
          <span className="art">{state.art + " "}</span>
          <span className="alb">{state.alb + " "}</span>
          {chars > 60 ? <p/> : null}
          <span className="track" style={style}>{state.track + " "}</span>
          {state.bitrate ? 
           <span className="bitrate" style={style}>{state.bitrate + " "}</span> 
           : null}
          {state.pause ? <span className="glyphicon glyphicon-pause" /> : null }
        </div>

      <comp.Progress played={state.played} length={state.length} />
      <p/>
      </div>
    );
  }
}

comp.Progress = function(props) {
  if (!props.played || props.length == "0:00")
    return <p/>;

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
        <span className="length">{props.length}</span>
      </div>
    </div>
  );
}

comp.Tracks = function(props) {

  if (props.state.sel || !props.state.tracks)
    return null;

  return (
    <div>
      {
        _.map(props.tracks, function(track, n) {
          return (
            <button key={n}
                    style={{fontSize: props.fsize + 'vw'}}
                    className = {n == props.state.trackNum ? "current" : "track"}
                    onClick = {_.partial(props.onClick, n) }
            >
              {track}
            </button>
          )
        })
      }
            <p></p>
    </div>
  );
}

comp.Albums = function(props) {
  var state = props.state;

  if (!(state.showAlbs && props.albs))
    return null;
  else {
    let albs = state.selAlbs || state.albs,
        fsize = lib.fsize(props.fsize, 3, 1.5);

    return (
      <div className="container albs">
        <p></p>
        <span style={{fontSize: props.fsize + 0.5 + 'vw'}}>{state.selArt + ': '}</span>
        {
          _.map(props.albs, function(alb, n) {
            return (
              <button key={n}
                      style={{fontSize: props.fsize + 'vw'}}
                      className = {n == state.albNum && !state.sel ? "current" : "alb"}
                      onClick = {_.partial(props.onClick, albs[n])}
              >
              {alb}
              </button>
            )
          })
        }
              <p/>
      </div>
    );
  }
}

comp.Artists = function(props) {
  if (!props.display)
    return null;

  return (
    <div>
      {
        _.map(props.arts.sort(), function(art, n) {
          return (
            <button key={n}
                    className="art"
                    onClick = { _.partial(props.onClick, art)}
            >
            {lib.strip(art, 20)}
            </button>
          )
        })
      }
    </div>
  );
}
