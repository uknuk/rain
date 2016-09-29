var comp = exports,
    React = require('react'),
    _ = require('lodash'),
    path = require('path'),
    lib = require('./lib.js');


comp.Info = function(props) {

  if (!props.display)
    return null;
  else {
    const maxChars = 160;
    let state = props.state,
        chars = _.sumBy(_.map(props.fields, (f) => state[f]), (val) => val ? val.length : 0),
        fsize = lib.fsize(maxChars/chars, 3, 1) + 'vw';

    return (
      <div className="container">
        {
        _.map(props.fields, function(key, n) {
        return <span key={n} className={key} style={{fontSize: fsize}}> {(state[key] || '') + ' '} </span>;
        })
        }

      { state.pause ? <span className="glyphicon glyphicon-pause" /> : null }

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
                    style={{fontSize: lib.fsize(props.fsize, 2.5, 1.25) + 'vw'}}
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
        <span style={{fontSize: fsize + 0.5 + 'vw'}}>{state.selArt + ': '}</span>
        {
          _.map(props.albs, function(alb, n) {
            return (
              <button key={n}
                      style={{fontSize: fsize + 'vw'}}
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


