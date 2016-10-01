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
        over = state.track.length + state.bitrate.length > 60,
        size = over ? "medium" : "large";

    return (
      <div className="container">
        <span className="art large">{state.art + " "}</span>
        <span className="alb large">{state.alb + " "}</span>
        {over ? <p/> : null}
        <span className={"track " + size}>{state.track + " " + state.bitrate}</span>
        {state.pause ? <span className="glyphicon glyphicon-pause" /> : null }

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
    <div className="row">
      <div className="col-sm-10">
        <div className="progress">
          <div className="progress-bar"
               style={{
                      width: lib.seconds(props.played)/lib.seconds(props.length)*100 + "%",
                      minWidth: "2em"
                      }}
               >
            <span className="played medium">{props.played}</span>
          </div>
        </div>
      </div>

      <div className="col-sm-2">
        <span className="length medium">{props.length}</span>
      </div>
    </div>
  );
}

comp.Tracks = function(props) {

  if (props.state.sel || !props.state.tracks)
    return null;

  return (
    <div className="container-fluid" style={{fontSize: props.fsize}}>
      {
        _.map(props.tracks, function(track, n) {
          return (
            <button key={n}
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
    let albs = state.selAlbs || state.albs;

    return (
      <div className="container-fluid albs" style={{fontSize: props.fsize}}>
        <p></p>
        <span >{state.selArt + ': '}</span>
        {
          _.map(props.albs, function(alb, n) {
            return (
              <button key={n}
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
    <div className = "art small">
      {
        _.map(props.arts.sort(), function(art, n) {
          return (
            <button key={n} onClick = { _.partial(props.onClick, art)} >
            {lib.short(art)}
            </button>
          )
        })
      }
    </div>
  );
}
