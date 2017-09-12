var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

var Tab = require('./tab')
var MAX_TABS = 8

inherits(Tabs, EventEmitter)

var tabs = []
var workspace = document.querySelector('.workspace')

function Tabs() {
  var self = this
  if (!(self instanceof Tabs)) return new Tabs()

  self.el = document.querySelector('#tabs')
}

Tabs.prototype.fileOpened = function (filepath) {
  var self = this

  var lastTab = self.el.querySelector('.active.tab')
  if (lastTab) lastTab.className = 'tab'

  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].filepath === filepath) {
      tabs[i].setActive()
      return
    }
  }

  self._newTab(filepath)
}

Tabs.prototype._newTab = function (filepath) {
  var self = this

  var tab = new Tab(filepath)

  tab.on('click', function () {
    self.emit('change', {
      path: tab.filepath
    })
  })

  tab.on('close', function () {
    self.el.removeChild(tab.el)

    var activePath = ''
    var index = tabs.indexOf(tab)
    tabs.splice(index, 1)
    if (self.el.childen.length === 0) {
      workspace.className = workspace.className + ' tabs-hidden'
    } else {
      var nextTab = tabs[index] || tabs[index - 1]
      console.log(`Setting ${nextTab.filepath} as active tab`)
      nextTab.setActive()
      activePath = nextTab.filepath
    }
    console.log(tabs)
    self.emit('close', {
      activePath: activePath,
    })
  })

  tabs.push(tab)
  self.el.insertBefore(tab.el, self.el.firstChild)

  if (tabs.length > MAX_TABS) {
    tabs[0].close()
    tabs.splice(0, 1)
  }

  workspace.className = workspace.className.replace(new RegExp('tabs-hidden', 'g'), '')
}

Tabs.prototype.fileRenamed = function (filepath, newFilepath) {
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].filepath === filepath) {
      tabs[i].rename(newFilepath)
      return
    }
  }
}

Tabs.prototype.fileDeleted = function (filepath) {
  for (var i = 0; i < tabs.length; i++) {
    if (tabs[i].filepath === filepath) {
      tabs[i].close()
      return
    }
  }
}

module.exports = new Tabs()
