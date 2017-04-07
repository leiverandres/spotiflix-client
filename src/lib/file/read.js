import io from 'socket.io-client';

function readFileFromServer(chunkCallback, endCallback, serverSocket) {
  const oFile = document.getElementById('file').files[0];
  const unit = 512 * 1024;
  let read = 0;
  let first = true;

  const reader = new FileReader();
  reader.readAsArrayBuffer(oFile.slice(read, read + unit));

  reader.onerror = e => {
    chunkCallback(e.target.error);
  };

  reader.onload = e => {
    let bytes = e.target.result;
    read += unit;

    let req = { filename: oFile.name, fileSize: oFile.size, data: bytes };
    if (read < oFile.size) {
      chunkCallback(null, read, oFile.size);
      let blob = oFile.slice(read, read + unit);
      reader.readAsArrayBuffer(blob);
    } else {
      req.end = true;
      endCallback();
    }

    if (first) {
      req.first = true;
      first = false;
    }

    serverSocket.emit('upload', req);
    if (req.end) {
      serverSocket.close();
    }
  };
}

export default function readFile(chunkCallback, endCallback, brokerSocket) {
  const oFile = document.getElementById('file').files[0];
  brokerSocket.on('upload_getServer', res => {
    console.log(res);
    if (res.status) {
      let serverSocket = io.connect(res.server);
      serverSocket.on('connect', () => {
        readFileFromServer(chunkCallback, endCallback, serverSocket);
      });
    } else {
      alert(res.message);
    }
  });
  brokerSocket.emit('upload_getServer', { filename: oFile.name });
}
