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

  // Visor de imágenes de la galería
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  document.querySelectorAll('.gallery-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (lightboxImg) {
        lightboxImg.src = btn.getAttribute('data-img');
        lightboxImg.alt = btn.querySelector('img').alt;
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = btn.getAttribute('data-caption') || '';
      }
    });
  });

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

  // Opiniones de clientes (se guardan en el navegador de quien las escribe)
  var REVIEWS_KEY = 'jyj_reviews';
  var WA_NUMBER = '56986941917';
  var reviewForm = document.getElementById('reviewForm');
  var reviewList = document.getElementById('reviewList');

  function loadReviews() {
    try {
      var data = JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }

  function saveReviews(list) {
    try { localStorage.setItem(REVIEWS_KEY, JSON.stringify(list.slice(0, 50))); return true; }
    catch (e) { return false; }
  }

  function fillStars(container, n) {
    container.textContent = '';
    for (var i = 1; i <= 5; i++) {
      var icon = document.createElement('i');
      icon.className = 'bi ' + (i <= Math.round(n) ? 'bi-star-fill' : 'bi-star');
      container.appendChild(icon);
    }
  }

  function renderReviews() {
    if (!reviewList) { return; }
    var reviews = loadReviews();
    var empty = document.getElementById('reviewEmpty');
    var avgEl = document.getElementById('reviewAvg');
    var avgStars = document.getElementById('reviewAvgStars');
    var totalEl = document.getElementById('reviewTotal');

    reviewList.textContent = '';
    if (empty) { empty.hidden = reviews.length > 0; }

    if (!reviews.length) {
      avgEl.textContent = '—';
      fillStars(avgStars, 0);
      totalEl.textContent = 'Aún no hay opiniones';
      return;
    }

    var sum = reviews.reduce(function (acc, r) { return acc + r.rating; }, 0);
    var avg = sum / reviews.length;
    avgEl.textContent = avg.toFixed(1).replace('.', ',');
    fillStars(avgStars, avg);
    totalEl.textContent = reviews.length + (reviews.length === 1 ? ' opinión' : ' opiniones');

    reviews.forEach(function (r) {
      var card = document.createElement('article');
      card.className = 'review-card';

      var head = document.createElement('div');
      head.className = 'review-head';
      var name = document.createElement('span');
      name.className = 'review-name';
      name.textContent = r.name;
      var date = document.createElement('span');
      date.className = 'review-date';
      date.textContent = new Date(r.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
      head.appendChild(name);
      head.appendChild(date);

      var stars = document.createElement('div');
      stars.className = 'stars';
      stars.setAttribute('role', 'img');
      stars.setAttribute('aria-label', r.rating + ' de 5 estrellas');
      fillStars(stars, r.rating);

      var text = document.createElement('p');
      text.className = 'review-text';
      text.textContent = r.text;

      card.appendChild(head);
      card.appendChild(stars);
      card.appendChild(text);
      reviewList.appendChild(card);
    });
  }

  if (reviewForm) {
    var reviewText = document.getElementById('reviewText');
    var charCount = document.getElementById('charCount');
    var reviewMsg = document.getElementById('reviewMsg');

    if (reviewText && charCount) {
      reviewText.addEventListener('input', function () {
        charCount.textContent = reviewText.value.length;
      });
    }

    function showMsg(kind, text) {
      reviewMsg.className = 'review-msg ' + (kind === 'error' ? 'is-error' : 'is-ok');
      reviewMsg.textContent = text;
    }

    reviewForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var checked = reviewForm.querySelector('input[name="rating"]:checked');
      var name = document.getElementById('reviewName').value.trim();
      var text = reviewText.value.trim();

      if (!checked) { showMsg('error', 'Elige una calificación de 1 a 5 estrellas.'); return; }
      if (!name) { showMsg('error', 'Escribe tu nombre.'); return; }
      if (text.length < 10) { showMsg('error', 'Cuéntanos un poco más (mínimo 10 caracteres).'); return; }

      var rating = parseInt(checked.value, 10);
      var reviews = loadReviews();
      reviews.unshift({ name: name, rating: rating, text: text, date: Date.now() });
      saveReviews(reviews);
      renderReviews();
      reviewForm.reset();
      if (charCount) { charCount.textContent = '0'; }

      // Mensaje de éxito + opción de enviar la opinión por WhatsApp a José
      var stars = new Array(rating + 1).join('★');
      var waText = 'Hola José, dejo mi opinión de JyJ Gasfitería:\n' + stars + ' (' + rating + '/5)\n' + text + '\n— ' + name;
      reviewMsg.className = 'review-msg is-ok';
      reviewMsg.textContent = '¡Gracias por tu opinión! ';
      var link = document.createElement('a');
      link.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(waText);
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Enviársela también a José por WhatsApp';
      reviewMsg.appendChild(link);
    });
  }

  renderReviews();

});