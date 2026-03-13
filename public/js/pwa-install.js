(function () {
  var standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  if (standalone) return;

  var isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isMobile = window.innerWidth < 992;

  var btn = document.getElementById('pwa-install-btn');
  var modalEl = document.getElementById('pwa-install-ios-modal');
  if (!btn) return;

  var deferredPrompt = null;

  function showBtn() {
    btn.classList.remove('d-none');
    btn.style.display = 'flex';
    btn.setAttribute('aria-hidden', 'false');
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (isMobile) showBtn();
  });

  if (isMobile) {
    showBtn();
  }

  window.addEventListener('resize', function () {
    isMobile = window.innerWidth < 992;
    if (!isMobile) {
      btn.classList.add('d-none');
      btn.style.display = 'none';
    } else if (!standalone) {
      showBtn();
    }
  });

  btn.addEventListener('click', function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
      });
      return;
    }
    if (isIOS && modalEl && window.bootstrap) {
      new bootstrap.Modal(modalEl).show();
      return;
    }
    alert(
      'Щоб встановити застосунок: меню браузера (⋮) → «Встановити застосунок» або «Додати на головний екран». У Chrome часто з’являється після кількох відвідувань сайту.'
    );
  });
})();
