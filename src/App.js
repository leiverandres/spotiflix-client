import React, { Component } from 'react';
import io from 'socket.io-client';
import { Circle } from 'rc-progress';
import { AppBody, AppHeader, AppLogo, AppTitle } from './components/App';
import logo from './spotiflix-logo.png';
import Reader from './components/File/Reader';

const serverIp = 'http://192.168.1.190:9000';
// Get this from broker
const movieList = ['nyancat.webm', 'lalaland.webm'];
const mimeCodec = 'video/webm; codecs="vorbis,vp8"';
let canAccessBuffer;

function play(serverSocket, media) {
  if (!canAccessBuffer) return;

  let video = document.querySelector('video');
  video.src = '';
  video.load();
  let mediaSource = new MediaSource();

  const filename = media;
  let first = true;

  video.src = window.URL.createObjectURL(mediaSource);
  mediaSource.addEventListener('sourceopen', function() {
    let sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
    sourceBuffer.mode = 'sequence';

    sourceBuffer.onupdateend = () => {
      console.log('Ended, requesting next');
      if (canAccessBuffer) serverSocket.emit('download', { filename });
    };

    serverSocket.on('download_init', res => {
      console.log('Received head');
      sourceBuffer.appendBuffer(res.data);
    });
    serverSocket.emit('download_init', { filename });

    serverSocket.on('download', res => {
      console.log('received', res.timecode, canAccessBuffer);
      if (!res.end && canAccessBuffer) {
        sourceBuffer.appendBuffer(res.data);
        if (first) {
          video.play();
          first = false;
        }
      } else {
        console.log('end');
      }
    });
  });
}

class App extends Component {
  state = {
    loaded: 0,
    canUpload: true,
    canSelect: true,
    connected: false,
    media: ''
  };
  serverSocket = null;

  componentWillMount = () => {
    console.log('Init socket');
    this.serverSocket = io.connect(serverIp);
    this.serverSocket.on('connect', () => {
      this.setState({ connected: true });
    });
    this.serverSocket.on('disconnect', () => {
      this.setState({ connected: false });
    });
  };

  handleChunkRead = (err, read, size) => {
    this.setState({
      loaded: Math.round(read / size * 100),
      canUpload: false
    });
  };

  handleReadEnd = () => {
    this.setState({ loaded: 0, canUpload: true });
    alert('File uploaded!');
  };

  handleMediaSelection = evt => {
    this.setState({ media: evt.target.value });
  };

  handlePlay = () => {
    if (this.state.media && this.state.connected) {
      this.setState({ canSelect: false });
      canAccessBuffer = true;
      play(this.serverSocket, this.state.media);
    } else {
      alert('Please select a file!');
    }
  };

  handleStop = () => {
    document.querySelector('video').pause();
    canAccessBuffer = false;
    this.setState({ canSelect: true });
  };

  render = () => {
    return (
      <AppBody backgroundColor="white">
        <AppHeader backgroundColor="#111" textColor="white">
          <AppLogo src={logo} alt="logo" />
          <AppTitle>Welcome to SpotiFlix</AppTitle>
        </AppHeader>
        <Reader
          serverSocket={this.serverSocket}
          chunkCallback={this.handleChunkRead}
          endCallback={this.handleReadEnd}
          canUpload={this.state.canUpload}
        />
        <div>
          <div style={{ width: '10%', height: '10%' }}>
            <Circle strokeWidth="5" percent={this.state.loaded} />
          </div>
          <video controls>
            lol
          </video>
          <select
            value={this.state.value}
            disabled={!this.state.canSelect}
            onChange={this.handleMediaSelection}
          >
            {['', ...movieList].map(elem => (
              <option value={elem} key={`movie-${elem}`}>
                {elem}
              </option>
            ))}
          </select>
          <button
            disabled={!this.state.canSelect || !this.state.connected}
            onClick={this.handlePlay}
          >
            Play
          </button>
          <button disabled={this.state.canSelect} onClick={this.handleStop}>
            Stop
          </button>
        </div>
      </AppBody>
    );
  };
}

export default App;
