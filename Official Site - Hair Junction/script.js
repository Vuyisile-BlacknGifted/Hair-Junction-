/**
 * Hair Junction — Main JavaScript
 * Handles navigation, hero carousel, tabs, FAQ, scroll effects
 */

document.addEventListener('DOMContentLoaded', function () {

  // --- Mobile Navigation ---
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav__link');

  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // --- Hero Carousel ---
  const slides = document.querySelectorAll('.hero__slide');
  const dotsContainer = document.getElementById('heroDots');
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  let currentSlide = 0;
  let slideInterval;

  slides.forEach(function (_, index) {
    const dot = document.createElement('button');
    dot.classList.add('hero__dot');
    if (index === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', 'Go to slide ' + (index + 1));
    dot.addEventListener('click', function () {
      goToSlide(index);
      resetInterval();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.hero__dot');
  const heroProgress = document.getElementById('heroProgress');
  const slideDuration = 5500;
  var progressTimer;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = index;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    resetProgress();
  }

  function resetProgress() {
    if (!heroProgress) return;
    clearInterval(progressTimer);
    heroProgress.style.width = '0';
    var start = Date.now();
    progressTimer = setInterval(function () {
      var elapsed = Date.now() - start;
      heroProgress.style.width = Math.min((elapsed / slideDuration) * 100, 100) + '%';
      if (elapsed >= slideDuration) clearInterval(progressTimer);
    }, 50);
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startInterval() {
    slideInterval = setInterval(nextSlide, slideDuration);
    resetProgress();
  }

  function resetInterval() {
    clearInterval(slideInterval);
    startInterval();
  }

  if (prevBtn) prevBtn.addEventListener('click', function () { prevSlide(); resetInterval(); });
  if (nextBtn) nextBtn.addEventListener('click', function () { nextSlide(); resetInterval(); });

  startInterval();

  // --- Collection Tabs ---
  window.activateCollectionTab = activateCollectionTab;

  const tabs = document.querySelectorAll('.collection-tab');
  const panels = document.querySelectorAll('.collection-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      activateCollectionTab(tab.getAttribute('data-tab'), false);
    });
  });

  document.querySelectorAll('[data-tab-link]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var tabName = link.getAttribute('data-tab-link');
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.style.overflow = '';
      activateCollectionTab(tabName, true);
    });
  });

  // --- FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-item__question');
    question.addEventListener('click', function () {
      var isActive = item.classList.contains('active');
      faqItems.forEach(function (fi) {
        fi.classList.remove('active');
        fi.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });
      if (!isActive) {
        item.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // --- Scroll Reveal ---
  const revealElements = document.querySelectorAll('.reveal');

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  // --- Contact Form ---
  // The contact form posts directly to mailto:info@hairjunction.co.za via its HTML attributes,
  // so we don't intercept submit in JavaScript. This keeps behaviour consistent on live hosting.

  // Trigger initial reveal for hero content
  setTimeout(function () {
    var heroContent = document.querySelector('.hero__content.reveal');
    if (heroContent) heroContent.classList.add('visible');
  }, 300);

  // --- Product details toggle & cart ---
  initProductCards();
  initCart();
  initSearch();

  // Open collection tab from URL ?tab=wigs
  var urlParams = new URLSearchParams(window.location.search);
  var tabParam = urlParams.get('tab');
  if (tabParam && document.getElementById('collections')) {
    activateCollectionTab(tabParam, true);
  }

});

/**
 * Switch collection tab and optionally scroll to collections
 */
function activateCollectionTab(tabName, shouldScroll) {
  var tabs = document.querySelectorAll('.collection-tab');
  var panels = document.querySelectorAll('.collection-panel');
  var tabBtn = document.querySelector('.collection-tab[data-tab="' + tabName + '"]');
  var panel = document.getElementById('panel-' + tabName);

  if (!tabBtn || !panel) return;

  tabs.forEach(function (t) { t.classList.remove('active'); });
  panels.forEach(function (p) { p.classList.remove('active'); });
  tabBtn.classList.add('active');
  panel.classList.add('active');
  panel.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
    el.classList.add('visible');
  });

  if (shouldScroll) {
    var collections = document.getElementById('collections');
    if (collections) {
      setTimeout(function () {
        collections.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }
}

/**
 * Parse R price from text
 */
function parsePrice(text) {
  if (!text) return 0;
  var match = String(text).replace(/,/g, '').match(/R\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

function formatPrice(amount) {
  return 'R' + amount.toLocaleString('en-ZA');
}

function getCardPrice(card) {
  var em = card.querySelector('.product-card__price em');
  if (em) return parsePrice(em.textContent);

  var table = card.querySelector('.bob-card__pricing table, .product-card__pricing table');
  if (table) {
    var prices = [];
    table.querySelectorAll('tbody td').forEach(function (td) {
      var p = parsePrice(td.textContent);
      if (p > 0) prices.push(p);
    });
    if (prices.length) return Math.min.apply(null, prices);
  }

  var simpleSpan = card.querySelector('.bob-card__pricing--simple span');
  if (simpleSpan) return parsePrice(simpleSpan.textContent);

  return 0;
}

function initProductCards() {
  document.querySelectorAll('.product-card, .bob-card').forEach(function (card, index) {
    var body = card.querySelector('.product-card__body') || card.querySelector('.bob-card__content');
    if (!body || body.classList.contains('is-enhanced')) return;
    body.classList.add('is-enhanced');

    var titleEl = body.querySelector('h3');
    var name = titleEl ? titleEl.textContent.trim() : 'Item ' + (index + 1);
    var id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var price = getCardPrice(card);
    var img = card.querySelector('img');
    var imgSrc = img ? img.getAttribute('src') : '';

    card.setAttribute('data-product-id', id);
    card.setAttribute('data-product-name', name);
    card.setAttribute('data-product-price', price);
    card.setAttribute('data-product-image', imgSrc);

    var panel = card.closest('.collection-panel');
    if (panel) {
      card.setAttribute('data-category', panel.id.replace('panel-', ''));
    } else if (card.closest('.new-release')) {
      card.setAttribute('data-category', 'new-release');
    }

    var detailNodes = body.querySelectorAll(
      '.product-card__desc, .product-card__meta, .product-card__pricing, .product-card__price, ' +
      '.bob-card__desc, .bob-card__stock, .bob-card__pricing'
    );

    // Always show minimal summary price outside details
    if (titleEl && price > 0) {
      var existingSummary = body.querySelector('.product-card__price--summary');
      if (!existingSummary) {
        var summary = document.createElement('p');
        summary.className = 'product-card__price product-card__price--summary';
        summary.innerHTML = 'From <em>' + formatPrice(price) + '</em>';
        titleEl.insertAdjacentElement('afterend', summary);
      }
    }

    var oldEnquire = body.querySelector('a.btn--outline');
    if (oldEnquire) oldEnquire.remove();

    var detailsWrap = document.createElement('div');
    detailsWrap.className = card.classList.contains('bob-card')
      ? 'bob-card__details product-details'
      : 'product-card__details product-details';
    detailsWrap.id = 'details-' + id;
    detailsWrap.setAttribute('hidden', '');

    detailNodes.forEach(function (node) {
      if (node.classList && node.classList.contains('product-card__price--summary')) return;
      detailsWrap.appendChild(node);
    });

    var category = card.getAttribute('data-category') || '';

    // Color options (wigs, bobs, curls — not hair care products)
    if (category !== 'products') {
      var colors = ['Natural Black', 'Jet Black', 'Brown', 'Highlight', 'Custom'];
      var colorWrap = document.createElement('div');
      colorWrap.className = 'variant';
      colorWrap.innerHTML =
        '<p class="variant__label">Color option</p>' +
        '<div class="variant__options" role="listbox" aria-label="Select a color"></div>';
      var optionsEl = colorWrap.querySelector('.variant__options');
      colors.forEach(function (c, i) {
        var colorBtn = document.createElement('button');
        colorBtn.type = 'button';
        colorBtn.className = 'variant__option' + (i === 0 ? ' is-active' : '');
        colorBtn.setAttribute('role', 'option');
        colorBtn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        colorBtn.setAttribute('data-color', c);
        colorBtn.textContent = c;
        optionsEl.appendChild(colorBtn);
      });
      card.setAttribute('data-selected-color', colors[0]);
      colorWrap.addEventListener('click', function (e) {
        var colorOpt = e.target.closest('.variant__option');
        if (!colorOpt) return;
        var selected = colorOpt.getAttribute('data-color') || colors[0];
        card.setAttribute('data-selected-color', selected);
        colorWrap.querySelectorAll('.variant__option').forEach(function (b) {
          b.classList.toggle('is-active', b === colorOpt);
          b.setAttribute('aria-selected', b === colorOpt ? 'true' : 'false');
        });
      });
      detailsWrap.appendChild(colorWrap);
    }

    var actions = document.createElement('div');
    actions.className = 'product-actions';

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'btn btn--text btn-toggle-details';
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', detailsWrap.id);
    toggleBtn.textContent = 'View Details';

    var addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn--primary btn--sm btn-add-cart';
    addBtn.textContent = 'Add to Cart';

    actions.appendChild(toggleBtn);
    actions.appendChild(addBtn);

    body.appendChild(detailsWrap);
    body.appendChild(actions);

    if (card.hasAttribute('data-details-open')) {
      detailsWrap.removeAttribute('hidden');
      detailsWrap.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.textContent = 'Hide Details';
    }

    toggleBtn.addEventListener('click', function () {
      var open = detailsWrap.hasAttribute('hidden');
      if (open) {
        detailsWrap.removeAttribute('hidden');
        detailsWrap.classList.add('is-open');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.textContent = 'Hide Details';
      } else {
        detailsWrap.setAttribute('hidden', '');
        detailsWrap.classList.remove('is-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.textContent = 'View Details';
      }
    });

    addBtn.addEventListener('click', function () {
      Cart.add({
        id: id,
        name: name,
        price: price,
        image: imgSrc,
        color: card.getAttribute('data-selected-color') || ''
      });
      addBtn.textContent = 'Added ✓';
      setTimeout(function () {
        addBtn.textContent = 'Add to Cart';
      }, 1400);
    });
  });
}

var Cart = {
  key: 'hair-junction-cart',
  items: [],

  load: function () {
    try {
      var saved = localStorage.getItem(this.key);
      this.items = saved ? JSON.parse(saved) : [];
    } catch (e) {
      this.items = [];
    }
  },

  save: function () {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.updateUI();
  },

  add: function (product) {
    var existing = this.items.find(function (item) {
      return item.id === product.id && (item.color || '') === (product.color || '');
    });
    if (existing) {
      existing.qty += 1;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        color: product.color || '',
        qty: 1
      });
    }
    this.save();
    openCart();
  },

  remove: function (id, color) {
    var c = color || '';
    this.items = this.items.filter(function (item) {
      return !(item.id === id && (item.color || '') === c);
    });
    this.save();
  },

  setQty: function (id, qty) {
    var item = this.items.find(function (i) {
      return i.id === id;
    });
    if (!item) return;
    item.qty = Math.max(1, qty);
    this.save();
  },

  clear: function () {
    this.items = [];
    this.save();
  },

  getTotal: function () {
    return this.items.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
  },

  updateUI: function () {
    var countEl = document.getElementById('cartCount');
    var itemsEl = document.getElementById('cartItems');
    var emptyEl = document.getElementById('cartEmpty');
    var totalEl = document.getElementById('cartTotal');

    if (!countEl) return;

    var count = this.items.reduce(function (n, item) {
      return n + item.qty;
    }, 0);
    countEl.textContent = count;
    countEl.classList.toggle('is-visible', count > 0);

    if (!itemsEl) return;

    itemsEl.innerHTML = '';
    this.items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'cart-item';
      li.innerHTML =
        '<div class="cart-item__info">' +
          (item.image ? '<img src="' + item.image + '" alt="" class="cart-item__thumb">' : '') +
          '<div><p class="cart-item__name">' + item.name + '</p>' +
          (item.color ? '<p class="cart-item__variant">Color: ' + item.color + '</p>' : '') +
          '<p class="cart-item__price">' + formatPrice(item.price) + '</p></div>' +
        '</div>' +
        '<div class="cart-item__controls">' +
          '<button type="button" class="cart-item__qty-btn" data-action="minus" data-id="' + item.id + '" aria-label="Decrease quantity">−</button>' +
          '<span class="cart-item__qty">' + item.qty + '</span>' +
          '<button type="button" class="cart-item__qty-btn" data-action="plus" data-id="' + item.id + '" aria-label="Increase quantity">+</button>' +
          '<button type="button" class="cart-item__remove" data-id="' + item.id + '" data-color="' + (item.color || '') + '" aria-label="Remove item">&times;</button>' +
        '</div>';
      itemsEl.appendChild(li);
    });

    if (emptyEl) emptyEl.hidden = this.items.length > 0;
    if (totalEl) totalEl.textContent = formatPrice(this.getTotal());
  }
};

function openCart() {
  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('cartOverlay');
  if (!drawer) return;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  if (overlay) {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
  }
  document.body.classList.add('cart-open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  var drawer = document.getElementById('cartDrawer');
  var overlay = document.getElementById('cartOverlay');
  if (!drawer) return;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  if (overlay) {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  document.body.classList.remove('cart-open');
  document.body.style.overflow = '';
}

function initCart() {
  Cart.load();
  Cart.updateUI();

  var toggle = document.getElementById('cartToggle');
  var closeBtn = document.getElementById('cartClose');
  var overlay = document.getElementById('cartOverlay');
  var clearBtn = document.getElementById('cartClear');
  var checkoutBtn = document.getElementById('cartCheckout');
  var itemsEl = document.getElementById('cartItems');

  if (toggle) toggle.addEventListener('click', openCart);
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (overlay) overlay.addEventListener('click', closeCart);

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      Cart.clear();
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      if (!Cart.items.length) {
        alert('Your bag is empty. Add items from Collections first.');
        return;
      }
      var lines = Cart.items.map(function (item) {
        var line = item.qty + ' × ' + item.name;
        if (item.color) line += ' (Color: ' + item.color + ')';
        line += ' — ' + formatPrice(item.price * item.qty);
        return line;
      });
      var msg =
        'Hi Hair Junction, I would like to order:\n\n' +
        lines.join('\n') +
        '\n\nSubtotal: ' + formatPrice(Cart.getTotal()) +
        '\n\nPlease confirm availability. Thank you!';
      window.open('https://wa.me/27682933107?text=' + encodeURIComponent(msg), '_blank');
    });
  }

  if (itemsEl) {
    itemsEl.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;
      var id = btn.getAttribute('data-id');
      if (!id) return;
      var color = btn.getAttribute('data-color') || '';

      if (btn.classList.contains('cart-item__remove')) {
        Cart.items = Cart.items.filter(function (it) {
          return !(it.id === id && (it.color || '') === color);
        });
        Cart.save();
        return;
      }

      var action = btn.getAttribute('data-action');
      var item = Cart.items.find(function (i) {
        return i.id === id && (i.color || '') === color;
      });
      if (!item) return;

      if (action === 'plus') Cart.setQty(id, item.qty + 1);
      if (action === 'minus') {
        if (item.qty <= 1) Cart.remove(id, color);
        else Cart.setQty(id, item.qty - 1);
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCart();
  });
}

var SearchIndex = [];

var CATEGORY_LABELS = {
  wigs: 'Wigs',
  bobs: 'Bobs',
  curls: 'Curls',
  products: 'Hair Products',
  'new-release': 'New Release'
};

function buildSearchIndex() {
  SearchIndex = [];
  document.querySelectorAll('.product-card, .bob-card').forEach(function (card) {
    var name = card.getAttribute('data-product-name') || '';
    var id = card.getAttribute('data-product-id') || '';
    if (!name || !id) return;

    var descEl = card.querySelector('.product-card__desc, .bob-card__desc');
    var desc = descEl ? descEl.textContent.trim() : '';
    var category = card.getAttribute('data-category') || '';
    var price = parseInt(card.getAttribute('data-product-price'), 10) || 0;
    var image = card.getAttribute('data-product-image') || '';
    var searchText = (name + ' ' + desc + ' ' + category + ' ' + (CATEGORY_LABELS[category] || '')).toLowerCase();

    SearchIndex.push({
      id: id,
      name: name,
      desc: desc,
      category: category,
      price: price,
      image: image,
      element: card,
      searchText: searchText
    });
  });
}

function initSearch() {
  buildSearchIndex();

  var overlay = document.getElementById('searchOverlay');
  var toggle = document.getElementById('searchToggle');
  var closeBtn = document.getElementById('searchClose');
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var hint = document.getElementById('searchHint');

  if (!overlay || !input || !results) return;

  function openSearch() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('search-open');
    document.body.style.overflow = 'hidden';
    input.value = '';
    renderSearchResults('');
    setTimeout(function () { input.focus(); }, 120);
  }

  function closeSearch() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('search-open');
    document.body.style.overflow = '';
  }

  function renderSearchResults(query) {
    var q = query.trim().toLowerCase();
    results.innerHTML = '';

    if (!q) {
      if (hint) {
        hint.textContent = 'Type to find products across our catalogue';
        hint.hidden = false;
      }
      return;
    }

    var matches = SearchIndex.filter(function (item) {
      return item.searchText.indexOf(q) !== -1;
    });

    if (hint) {
      hint.textContent = matches.length
        ? matches.length + ' result' + (matches.length === 1 ? '' : 's') + ' found'
        : 'No products match your search';
      hint.hidden = false;
    }

    if (!matches.length) return;

    matches.slice(0, 12).forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'search-result';
      li.setAttribute('role', 'option');
      li.innerHTML =
        '<button type="button" class="search-result__btn" data-product-id="' + item.id + '">' +
          (item.image ? '<img src="' + item.image + '" alt="" class="search-result__thumb">' : '') +
          '<span class="search-result__info">' +
            '<span class="search-result__name">' + item.name + '</span>' +
            '<span class="search-result__meta">' + (CATEGORY_LABELS[item.category] || 'Collection') +
              (item.price ? ' · From ' + formatPrice(item.price) : '') + '</span>' +
          '</span>' +
        '</button>';
      results.appendChild(li);
    });
  }

  function goToProduct(id) {
    var item = SearchIndex.find(function (i) { return i.id === id; });
    if (!item || !item.element) return;

    closeSearch();

    if (item.category && item.category !== 'new-release') {
      activateCollectionTab(item.category, true);
    } else if (item.category === 'new-release') {
      var section = document.getElementById('new-release');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setTimeout(function () {
      item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      item.element.classList.add('product-highlight');
      setTimeout(function () {
        item.element.classList.remove('product-highlight');
      }, 2200);
    }, item.category && item.category !== 'new-release' ? 450 : 100);
  }

  if (toggle) toggle.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeSearch();
  });

  input.addEventListener('input', function () {
    renderSearchResults(input.value);
  });

  results.addEventListener('click', function (e) {
    var btn = e.target.closest('.search-result__btn');
    if (!btn) return;
    goToProduct(btn.getAttribute('data-product-id'));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeSearch();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });
}
