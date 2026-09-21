document.addEventListener('DOMContentLoaded', function () {

  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var navbar = document.getElementById('mainNavbar');
  var backToTopBtn = document.getElementById('backToTop');
  var SCROLL_THRESHOLD = 60;

  function handleScroll() {
    var scrolled = window.scrollY > SCROLL_THRESHOLD;
    if (navbar) {
      navbar.classList.toggle('scrolled', scrolled);
    }
    if (backToTopBtn) {
      backToTopBtn.classList.toggle('is-visible', window.scrollY > 500);
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var navMenu = document.getElementById('navMenu');
  if (navMenu) {
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (navMenu.classList.contains('show')) {
          var collapse = bootstrap.Collapse.getOrCreateInstance(navMenu);
          collapse.hide();
        }
      });
    });
  }

  var revealItems = document.querySelectorAll('.reveal');
  var pipeline = document.querySelector('.pipeline');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealItems.forEach(function (item) { revealObserver.observe(item); });

    if (pipeline) {
      var pipelineObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      pipelineObserver.observe(pipeline);
    }
  } else {
    revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    if (pipeline) { pipeline.classList.add('is-visible'); }
  }

});
