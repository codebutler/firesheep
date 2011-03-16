//
// sidebar.js
// Part of the Firesheep project.
//
// Copyright (C) 2010 Eric Butler
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

Components.utils.import('resource://firesheep/Firesheep.js');
Components.utils.import('resource://firesheep/util/Utils.js');
Components.utils.import('resource://firesheep/util/Observers.js');

var mainWindow = null;

function startup() {
  mainWindow = window.QueryInterface(Ci.nsIInterfaceRequestor)
                     .getInterface(Ci.nsIWebNavigation)
                     .QueryInterface(Ci.nsIDocShellTreeItem)
                     .rootTreeItem
                     .QueryInterface(Ci.nsIInterfaceRequestor)
                     .getInterface(Ci.nsIDOMWindow);
  
  reloadSession();
  updateState();
}

function shutdown() {
  Firesheep.stopCapture();
}

window.addEventListener("load", startup, false);
window.addEventListener("unload", shutdown, false);

function reloadSession () {
  var list = document.getElementById('resultsList');
  
  while (list.getRowCount() > 0)
    list.removeItemAt(0);
  
  Firesheep.results.forEach(function (packet) {
    addResult(packet);
  });
  
  onResultSelect();
}

function updateState () {
  var captureButton = document.getElementById('captureButton');
  captureButton.label = (Firesheep.isCapturing) ? 'Stop Capturing' : 'Start Capturing';
}

var callback = function (data) {
  try {
    switch (data.action) {
      case 'session_loaded':
        reloadSession();
        break;
      case 'capture_started':
        updateState();
        break;
      case 'capture_stopped':
        updateState()
        break;
      case 'result_added':
        addResult(data.result);
        break;
      case 'error':
        throw data.error;
    }
  } catch (e) {
    dump(e + "\n");
    if (e.stack)
      dump(e.stack + "\n");
    var errors = document.getElementById('errors');
    errors.appendNotification(e.toString());
    updateState();
  }
};

var context = this;
Observers.add('Firesheep', function () {
  callback.apply(context, arguments);
});

function addResult (result) {
  var list = document.getElementById('resultsList');
  
  var item = document.createElement('richlistitem');
  item.setAttribute('style', 'padding-left: 6px');
  item.setAttribute('resultId', Firesheep.results.indexOf(result));
  
  var hbox = document.createElement('hbox');
  hbox.setAttribute('align', 'center');
  
  var image = document.createElement('image');
  
  if (result.userAvatar)
    image.setAttribute('src', result.userAvatar);
  else
    image.setAttribute('src', 'chrome://firesheep/skin/default_avatar.jpg');
    
  image.setAttribute('style', 'min-width: 32px; min-height: 32px; max-width: 32px; max-height: 32px');
  
  var spacer = document.createElement('spacer');
  spacer.setAttribute('flex', 1);
  
  var iconWidget = document.createElement('hbox');
  iconWidget.appendChild(spacer);
  iconWidget.setAttribute('align', 'end');
    
  var icon = document.createElement('image');
  icon.setAttribute('src', result.siteIcon);
  icon.setAttribute('style', 'right: 0; bottom: 0; max-width: 16px; max-height: 16px;');
  
  iconWidget.appendChild(icon);
  
  var picStack = document.createElement('stack');
  picStack.appendChild(image);
  picStack.appendChild(iconWidget);
  
  hbox.appendChild(picStack);
  
  var vbox = document.createElement('vbox');
  
  var label = document.createElement('label');  
  if (!result.error) {
    if (result.userName) {
      label.setAttribute('value', result.userName);
      label.setAttribute('style', 'font-weight: bold');
    } else {
      label.setAttribute('value', 'unknown user');
      label.setAttribute('style', 'font-weight: bold; font-style: italic');
    }
  } else {
    label.setAttribute('value', 'error');
    label.setAttribute('style', 'font-weight: bold; font-style: italic');
  }
  vbox.appendChild(label);
  
  label = document.createElement('label');
  label.setAttribute('value', result.siteName);
  vbox.appendChild(label);
  
  hbox.appendChild(vbox);
  
  item.appendChild(hbox);
  
  list.appendChild(item);
}
 
function onResultDoubleClick () {
  try {
    var resultsList = document.getElementById('resultsList');
    var selectedItem = resultsList.selectedItem;
    if (selectedItem) {
      var id = selectedItem.getAttribute('resultId');
      var result = Firesheep.results[id];
      
      if (result.handler.spoofUserAgent) {
        // FIXME!
        if (window.navigator.userAgent != result.firstPacket.userAgent) {
          var errors = document.getElementById('errors');
          errors.appendNotification('User agent spoofing not yet implemented.');
          return;
        }
      }

      var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
      var cookieUri = ios.newURI(result.siteUrl, null, null);

      deleteDomainCookies(cookieUri);
  
      var cookieSvc = Cc["@mozilla.org/cookieService;1"].getService(Ci.nsICookieService);
      for (var cookieName in result.firstPacket.cookies) {
        var cookieValue = result.firstPacket.cookies[cookieName];
        var cookieString = cookieName + '=' + cookieValue + ';domain=.' + cookieUri.host;
        cookieSvc.setCookieString(cookieUri, null, cookieString, null);
      }
      
      mainWindow.gBrowser.selectedTab = mainWindow.gBrowser.addTab(result.siteUrl);
    }
  } catch (e) {
    alert(e);
  }
}

function onResultSelect () {
  var tree = document.getElementById('detailsTree');
  var children = tree.getElementsByTagName("treechildren")[0];
  
  while (children.childNodes.length > 0)
      children.removeChild(children.childNodes[0]);

  var resultsList = document.getElementById('resultsList');
  var selectedItem = resultsList.selectedItem;
  if (selectedItem) {
    var id = selectedItem.getAttribute('resultId');
    var result = Firesheep.results[id];
    displayObject(children, result);
  }
}

function displayObject(treeChildren, obj) {
  for (var key in obj) {
    var val = obj[key];

    if (typeof(val) == 'function')
      continue;
        
    switch (typeof(val)) {
      case 'object':
        if (val != null) {
          var newChildren = addTreeItem(treeChildren, key, {});
          displayObject(newChildren, val);
        } else {
          addTreeItem(treeChildren, key, null);
        }
        break;

      default:
        addTreeItem(treeChildren, key, val);
    }
  }
}

function addTreeItem (treeChildren, key, val)
{
  var treeItem = document.createElement("treeitem");
  treeItem.setAttribute("open", "true");
  if (val != null && typeof(val) == "object") {
    treeItem.setAttribute("container", "true");
  }
    
  var treeRow = document.createElement("treerow");

  var treeCell = document.createElement("treecell");
  treeCell.setAttribute("label", key);      
  treeRow.appendChild(treeCell);
  
  treeCell = document.createElement("treecell");
  if (val != null && typeof(val) != "object") {
    treeCell.setAttribute("label", val);
  } else if (val == null) {
    treeCell.setAttribute("label", "(null)");
    treeCell.setAttribute("properties", "nullValue");
  }
  
  treeRow.appendChild(treeCell);
  
  var newTreeChildren = document.createElement("treechildren");
  treeItem.appendChild(newTreeChildren);
  
  treeItem.appendChild(treeRow);
  
  treeChildren.appendChild(treeItem);
  
  return newTreeChildren;      
}

function toggleDetails()
{
  var tree = document.getElementById('detailsTree');
  var splitter = document.getElementById('splitter');
  var display = (tree.style['display'] == 'none') ? '' : 'none';
  tree.style.display = splitter.style.display = display;
}

function deleteDomainCookies(uri) 
{
  var cookieMgr = Cc['@mozilla.org/cookiemanager;1'].getService(Ci.nsICookieManager);
  var e = cookieMgr.enumerator;
  while (e.hasMoreElements()) {
    var cookie = e.getNext().QueryInterface(Ci.nsICookie);
    var cookieHost = cookie.host;
    if (cookieHost) {
      if (cookieHost.charAt(0) == ".")
        cookieHost = cookieHost.substring(1);
    
      if (uri.host == cookieHost)
        cookieMgr.remove(cookie.host, cookie.name, cookie.path, false);
    }
  }
}

function showMenu() 
{
  var button = document.getElementById('showMenuButton');
  var menu = document.getElementById('bottomMenu');
  menu.openPopup(button, "after_start", 0, 0, false, false);
}

function onDetailsContextMenu()
{
  var detailsTree = document.getElementById('detailsTree');
  var copyDetailsItem = document.getElementById('copyDetailsItem');
  copyDetailsItem.setAttribute('disabled', (detailsTree.currentIndex < 0));
}

function copyDetailValue()
{
  var detailsTree = document.getElementById('detailsTree');
  var valueText   = detailsTree.view.getCellText(detailsTree.currentIndex, detailsTree.columns.getColumnAt(1));

  var clipboard = Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
  clipboard.copyString(valueText);
}