'serviceWorker' in navigator && navigator.serviceWorker.register('/sw.js').then(reg => {

  // Trigger SW changes checking on a timer
  setInterval(() => { reg.update(); }, 1000*60);

  // Prompt user to get latest update
  const updatePage = () => {
    const confirmMsg = "Update available.\nClick OK to reload this page and get the latest version.";
    confirm(confirmMsg) && window.location.reload();
  }

  // Execute a task when SW changes to installed
  const trackProgress = (sw) => {
    sw.addEventListener('statechange', () => {
      sw.state === 'installed' && updatePage();
    });
  }

  // When no service worker exists yet
  if( navigator.serviceWorker.controller === null ) {
    return;
  }

  // SW ready
  if( reg.waiting ) {
    updatePage();
    return;
  }

  // SW almost ready
  if( reg.installing ) {
    trackProgress(reg.installing);
    return;
  }

  // New SW found
  reg.addEventListener('updatefound', () => {
    trackProgress(reg.installing);
  });

});
