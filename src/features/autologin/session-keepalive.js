// Touch session regularly to keep it alive
setInterval(() => {
  require('core/ajax').call([{ methodname: 'core_session_touch', args: {} }])
}, 5 * 60 * 1000) // 5 minutes
