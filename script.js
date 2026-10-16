document.addEventListener('DOMContentLoaded', function () {
  // CONEXIÓN CON SUPABASE
  // Usa únicamente la clave Publishable, nunca la contraseña
  // de la base de datos ni las claves Secret o service_role.
  var SUPABASE_URL = 'https://rbjpvlipgtajevtfdyxd.supabase.co';
  var SUPABASE_KEY = 'RJebIHBdlIj7YSHa';

  var db = null;

  if (
    window.supabase &&
    SUPABASE_KEY !== 'RJebIHBdlIj7YSHa'
  ) {
    try {
      db = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
      );
    } catch (error) {
      console.error('No se pudo iniciar Supabase:', error);
    }
  }

  // AÑO DEL PIE DE PÁGINA
  var yearEl = document.getElementById('year');

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // BARRA DE NAVEGACIÓN Y BOTÓN PARA SUBIR
  var navbar = document.getElementById('mainNavbar');
  var backToTopBtn = document.getElementById('backToTop');

  function handleScroll() {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }

    if (backToTopBtn) {
      backToTopBtn.classList.toggle(
        'is-visible',
        window.scrollY > 500
      );
    }
  }

  window.addEventListener('scroll', handleScroll, {
    passive: true
  });

  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // CERRAR EL MENÚ MÓVIL AL ELEGIR UNA SECCIÓN
  var navMenu = document.getElementById('navMenu');

  if (navMenu) {
    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (
          navMenu.classList.contains('show') &&
          window.bootstrap
        ) {
          window.bootstrap.Collapse
            .getOrCreateInstance(navMenu)
            .hide();
        }
      });
    });
  }

  // VISOR DE IMÁGENES
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');

  document.querySelectorAll('.gallery-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var image = btn.querySelector('img');

      if (lightboxImg) {
        lightboxImg.src = btn.getAttribute('data-img') || '';
        lightboxImg.alt = image ? image.alt : '';
      }

      if (lightboxCaption) {
        lightboxCaption.textContent =
          btn.getAttribute('data-caption') || '';
      }
    });
  });

  // ANIMACIONES AL DESPLAZARSE
  var revealItems = document.querySelectorAll('.reveal');
  var pipeline = document.querySelector('.pipeline');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });

    if (pipeline) {
      var pipelineObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      pipelineObserver.observe(pipeline);
    }
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });

    if (pipeline) {
      pipeline.classList.add('is-visible');
    }
  }

  // OPINIONES COMPARTIDAS EN SUPABASE
  var WA_NUMBER = '56986941917';
  var reviewForm = document.getElementById('reviewForm');
  var reviewList = document.getElementById('reviewList');
  var reviewEmpty = document.getElementById('reviewEmpty');
  var reviewAvg = document.getElementById('reviewAvg');
  var reviewAvgStars = document.getElementById('reviewAvgStars');
  var reviewTotal = document.getElementById('reviewTotal');
  var reviewMsg = document.getElementById('reviewMsg');
  var reviewText = document.getElementById('reviewText');
  var charCount = document.getElementById('charCount');
  var sendingReview = false;

  function showMsg(kind, message) {
    if (!reviewMsg) {
      return;
    }

    reviewMsg.className =
      'review-msg ' + (kind === 'error' ? 'is-error' : 'is-ok');

    reviewMsg.textContent = message;
  }

  function fillStars(container, rating) {
    if (!container) {
      return;
    }

    container.textContent = '';

    for (var i = 1; i <= 5; i++) {
      var icon = document.createElement('i');

      icon.className =
        'bi ' + (i <= Math.round(rating)
          ? 'bi-star-fill'
          : 'bi-star');

      container.appendChild(icon);
    }
  }

  async function loadReviews() {
    if (!db) {
      throw new Error('Falta configurar la conexión con Supabase.');
    }

    var result = await db
      .from('reviews')
      .select('id, name, rating, text, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (result.error) {
      throw result.error;
    }

    return result.data || [];
  }

  async function saveReview(review) {
    if (!db) {
      throw new Error('Falta configurar la conexión con Supabase.');
    }

    var result = await db
      .from('reviews')
      .insert({
        name: review.name,
        rating: review.rating,
        text: review.text
      });

    if (result.error) {
      throw result.error;
    }
  }

  async function renderReviews() {
    if (!reviewList) {
      return;
    }

    reviewList.setAttribute('aria-busy', 'true');

    if (reviewEmpty) {
      reviewEmpty.hidden = false;
      reviewEmpty.textContent = 'Cargando opiniones…';
    }

    try {
      var reviews = await loadReviews();

      reviewList.textContent = '';

      if (reviewEmpty) {
        reviewEmpty.hidden = reviews.length > 0;
        reviewEmpty.textContent = 'Sé el primero en dejar tu opinión.';
      }

      if (!reviews.length) {
        if (reviewAvg) {
          reviewAvg.textContent = '—';
        }

        fillStars(reviewAvgStars, 0);

        if (reviewTotal) {
          reviewTotal.textContent = 'Aún no hay opiniones';
        }

        return;
      }

      var sum = reviews.reduce(function (total, review) {
        return total + Number(review.rating);
      }, 0);

      var average = sum / reviews.length;

      if (reviewAvg) {
        reviewAvg.textContent =
          average.toFixed(1).replace('.', ',');
      }

      fillStars(reviewAvgStars, average);

      if (reviewTotal) {
        reviewTotal.textContent =
          reviews.length +
          (reviews.length === 1 ? ' opinión' : ' opiniones');
      }

      reviews.forEach(function (review) {
        var card = document.createElement('article');
        card.className = 'review-card';

        var head = document.createElement('div');
        head.className = 'review-head';

        var name = document.createElement('span');
        name.className = 'review-name';
        name.textContent = review.name;

        var date = document.createElement('span');
        date.className = 'review-date';
        date.textContent = new Date(
          review.created_at
        ).toLocaleDateString('es-CL', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });

        head.appendChild(name);
        head.appendChild(date);

        var stars = document.createElement('div');
        stars.className = 'stars';
        stars.setAttribute('role', 'img');
        stars.setAttribute(
          'aria-label',
          review.rating + ' de 5 estrellas'
        );

        fillStars(stars, review.rating);

        var text = document.createElement('p');
        text.className = 'review-text';
        text.textContent = review.text;

        card.appendChild(head);
        card.appendChild(stars);
        card.appendChild(text);

        reviewList.appendChild(card);
      });
    } catch (error) {
      console.error('Error al cargar opiniones:', error);

      if (reviewEmpty) {
        reviewEmpty.hidden = false;
        reviewEmpty.textContent =
          'No se pudieron cargar las opiniones. Intenta más tarde.';
      }

      if (reviewTotal) {
        reviewTotal.textContent = 'Opiniones no disponibles';
      }
    } finally {
      reviewList.setAttribute('aria-busy', 'false');
    }
  }

  // CONTADOR DE CARACTERES
  if (reviewText && charCount) {
    reviewText.addEventListener('input', function () {
      charCount.textContent = reviewText.value.length;
    });
  }

  // ENVÍO DE OPINIONES
  if (reviewForm) {
    reviewForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      if (sendingReview) {
        return;
      }

      if (!db) {
        showMsg(
          'error',
          'El formulario todavía no está disponible. Intenta más tarde.'
        );
        return;
      }

      var checked = reviewForm.querySelector(
        'input[name="rating"]:checked'
      );

      var nameInput = document.getElementById('reviewName');
      var name = nameInput ? nameInput.value.trim() : '';
      var text = reviewText ? reviewText.value.trim() : '';
      var rating = checked ? Number(checked.value) : 0;

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        showMsg(
          'error',
          'Elige una calificación de 1 a 5 estrellas.'
        );
        return;
      }

      if (!name || name.length > 40) {
        showMsg(
          'error',
          'Escribe tu nombre, con un máximo de 40 caracteres.'
        );
        return;
      }

      if (text.length < 10 || text.length > 400) {
        showMsg(
          'error',
          'La opinión debe tener entre 10 y 400 caracteres.'
        );
        return;
      }

      var submitBtn = reviewForm.querySelector(
        'button[type="submit"]'
      );

      sendingReview = true;

      if (submitBtn) {
        submitBtn.disabled = true;
      }

      showMsg('ok', 'Enviando opinión…');

      try {
        await saveReview({
          name: name,
          rating: rating,
          text: text
        });

        reviewForm.reset();

        if (charCount) {
          charCount.textContent = '0';
        }

        showMsg(
          'ok',
          '¡Gracias! Tu opinión aparecerá cuando sea aprobada. '
        );

        // El enlace solo envía un mensaje si el visitante lo pulsa.
        if (reviewMsg) {
          var stars = '★'.repeat(rating);
          var waText =
            'Hola José, dejo mi opinión de JyJ Gasfitería:\n' +
            stars + ' (' + rating + '/5)\n' +
            text + '\n— ' + name;

          var link = document.createElement('a');
          link.href =
            'https://wa.me/' + WA_NUMBER +
            '?text=' + encodeURIComponent(waText);

          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent =
            'Enviársela también a José por WhatsApp';

          reviewMsg.appendChild(link);
        }
      } catch (error) {
        console.error('Error al enviar opinión:', error);

        showMsg(
          'error',
          'No se pudo confirmar el envío. Revisa tu conexión e intenta nuevamente.'
        );
      } finally {
        sendingReview = false;

        if (submitBtn) {
          submitBtn.disabled = false;
        }
      }
    });
  }

  renderReviews();
});