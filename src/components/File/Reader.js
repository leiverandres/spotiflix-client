import React from 'react';
import readFile from '../../lib/file/read';

function Reader({ serverSocket, chunkCallback, endCallback, canUpload }) {
  return (
    <div>
      <label htmlFor="file">Add a song or video: </label>
      <input
        type="file"
        id="file"
        name="file"
        disabled={!canUpload}
        onChange={() => readFile(chunkCallback, endCallback, serverSocket)}
        accept="video/webm"
      />
    </div>
  );
}

Reader.propTypes = {
  chunkCallback: React.PropTypes.func.isRequired,
  endCallback: React.PropTypes.func.isRequired,
  canUpload: React.PropTypes.bool.isRequired
};

export default Reader;
