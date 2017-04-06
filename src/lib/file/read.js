export default function readFile(chunkCallback, endCallback, serverSocket) {
  const oFile = document.getElementById('file').files[0];
  const unit = 512 * 1024;
  let read = 0;

  const reader = new FileReader();
  reader.readAsArrayBuffer(oFile.slice(read, read + unit));

  reader.onerror = e => {
    chunkCallback(e.target.error);
  };

  reader.onload = e => {
    let bytes = e.target.result;
    read += unit;

    serverSocket.emit('upload', {
      filename: oFile.name,
      data: bytes
    });

    if (read < oFile.size) {
      chunkCallback(null, read, oFile.size);
      let blob = oFile.slice(read, read + unit);
      reader.readAsArrayBuffer(blob);
    } else {
      endCallback();
    }
  };
}
