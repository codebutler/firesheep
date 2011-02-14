//
// FiresheepWorker.js
// Part of the Firesheep project.
//
// Copyright (C) 2010-2011 Eric Butler
//
// Authors:
//   Eric Butler <eric@codebutler.com>
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


function onmessage (event)
{
  try {
    var msg = event.data;
    switch (msg.type) {
      case 'start':
        capture(msg.process);
        break;

      case 'stop':
        process.Stop();
        break;
    }
  } catch (ex) {
    postMessageObject({ type: 'error', error: ex.message });
  }
}

function capture(aProcess)
{
  var process = aProcess;

  postMessageObject({ type: 'started' });

  /* Read stdout until process exits */
  var line;
  while (line = process.ReadOutputLine()) {
    postMessageObject({ type: 'packet', packet: JSON.parse(line) });
  }

  /* Read any errors */
  var errors = [];
  while (line = process.ReadErrorLine()) {
    errors.push(line);
  }
  
  var exitCode = process.Wait();
  if (exitCode != 0 && exitCode != 15) {
    if (errors.length == 0)
      throw 'Backend exited with error ' + exitCode + '.';
    else
      throw errors.join(', ');
  }

  postMessageObject({ type: 'stopped' });
}

function postMessageObject (obj)
{
  postMessage(JSON.stringify(obj));
}
