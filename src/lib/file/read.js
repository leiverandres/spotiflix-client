import io from 'socket.io-client';

function readFileFromServer(chunkCallback, endCallback, serverSocket) {
  const oFile = document.getElementById('file').files[0];
  const unit = 512 * 1024;
  let read = 0, partNo = 0;
  let first = true;

  const reader = new FileReader();
  reader.readAsArrayBuffer(oFile.slice(read, read + unit));

  reader.onerror = e => {
    chunkCallback(e.target.error);
  };

  reader.onload = e => {
    let bytes = e.target.result;
    read += unit;
    partNo++;

    let req = {
      filename: oFile.name,
      fileSize: oFile.size,
      data: bytes,
      partNo
    };

    if (first) {
      serverSocket.emit('upload_first', req);
    }

    if (read < oFile.size) {
      chunkCallback(null, read, oFile.size);
      if (!first) {
        serverSocket.emit('upload', req);
      } else {
        first = false;
      }
      let blob = oFile.slice(read, read + unit);
      reader.readAsArrayBuffer(blob);
    } else {
      serverSocket.emit('upload_end', req);
      endCallback();
    }

    serverSocket.on('upload', data => {
      if (!data.status) {
        alert(data.message);
        return;
      }
    });
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
