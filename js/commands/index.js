/**
 * Command Registry
 * Asynchronously loads all command handlers and collects them
 */

(function() {
  'use strict';

  var commandNames = [
    'clear', 'help', 'exit', 'gameinfo', 'backupfs',
    'cd', 'pwd', 'ls', 'cat', 'mkdir', 'touch', 'rm', 'cp', 'mv',
    'whoami', 'hostname', 'uname', 'echo', 'date',
    'lsblk', 'df', 'free', 'ps', 'top',
    'man', 'login', 'useradd', 'adduser', 'logout'
  ];

  var commands = {};
  var index = 0;

  function loadNext() {
    if (index >= commandNames.length) {
      window.CommandRegistry = commands;
      return;
    }

    var name = commandNames[index];
    index++;
    var url = 'js/commands/' + name + '.js';

    $.getScript(url)
      .done(function() {
        var globalName = 'Cmd' + name.charAt(0).toUpperCase() + name.slice(1);
        if (window[globalName]) {
          commands[name] = window[globalName];
        }
        loadNext();
      })
      .fail(function() {
        loadNext();
      });
  }

  loadNext();
})();
