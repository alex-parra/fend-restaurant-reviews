'serviceWorker' in navigator && navigator.serviceWorker.register('/sw.js').then(reg => {

  // Trigger SW changes checking on a timer
  setInterval(() => { reg.update(); }, 1000*60)

  const updatePage = () => {
    const confirmMsg = "Update available.\nClick OK to reload this page and get the latest version.";
    confirm(confirmMsg) && window.location.reload();
  }

  const trackProgress = (sw) => {
    sw.addEventListener('statechange', () => {
      sw.state === 'installed' && updatePage()
    })
  }

  if( navigator.serviceWorker.controller === null ) {
    // When no service worker exists yet
    return;
  }

  if( reg.waiting ) {
    updatePage();
    return;
  }

  if( reg.installing ) {
    trackProgress(reg.installing);
    return;
  }

  reg.addEventListener('updatefound', () => {
    trackProgress(reg.installing)
  })
});
