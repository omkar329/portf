// Portfolio of Omkar Kaunsalye - script.js

// Typing effect for hero section
const typedText = [
  'AI/ML Engineer',
  'Full Stack Developer',
  'Web Enthusiast',
  'Open to Opportunities'
];
let typedIndex = 0, charIndex = 0, isDeleting = false;
let typedElem = null;

function type() {
  if (!typedElem) return;
  let current = typedText[typedIndex];

  if (isDeleting) {
    typedElem.textContent = current.substring(0, charIndex--);
    if (charIndex < 0) {
      isDeleting = false;
      typedIndex = (typedIndex + 1) % typedText.length;
      setTimeout(type, 600);
      return;
    }
  } else {
    typedElem.textContent = current.substring(0, charIndex++);
    if (charIndex > current.length) {
      isDeleting = true;
      setTimeout(type, 1200);
      return;
    }
  }
  setTimeout(type, isDeleting ? 40 : 90);
}

document.addEventListener('DOMContentLoaded', () => {
  typedElem = document.getElementById('typed');
  type();
});
// Reveal hero overlays after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero-overlay').forEach(el => el.classList.add('visible'));
});

// Smooth scroll for nav links
document.querySelectorAll('.navbar a, .footer-links a').forEach(link => {
  link.addEventListener('click', function(e) {
    if (this.hash && document.querySelector(this.hash)) {
      e.preventDefault();
      document.querySelector(this.hash).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Light/Dark theme toggle (accessible) — support both header `#theme-toggle` and in-list `.nav-theme-btn`
function updateThemeButtons(isLight) {
  // header button
  const headerBtn = document.getElementById('theme-toggle');
  if (headerBtn) {
    headerBtn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    const icon = headerBtn.querySelector('.theme-icon');
    const label = headerBtn.querySelector('.theme-label');
    if (icon) icon.textContent = isLight ? '🌞' : '🌙';
  }
  // in-list buttons
  document.querySelectorAll('.nav-theme-btn').forEach(b => {
    b.setAttribute('aria-pressed', isLight ? 'true' : 'false');
    const icon = b.querySelector('.theme-icon');
    const label = b.querySelector('.theme-label');
    if (icon) icon.textContent = isLight ? '🌞' : '🌙';
  });
}

(function initThemeToggles(){
  const headerBtn = document.getElementById('theme-toggle');
  const inlineBtns = Array.from(document.querySelectorAll('.nav-theme-btn'));
  const isLight = document.body.classList.contains('light');
  updateThemeButtons(isLight);

  function toggleTheme() {
    const nowLight = document.body.classList.toggle('light');
    updateThemeButtons(nowLight);
  }

  if (headerBtn) headerBtn.addEventListener('click', toggleTheme);
  inlineBtns.forEach(b => b.addEventListener('click', toggleTheme));
})();

// Mobile nav toggle (supports multiple pages)
document.querySelectorAll('.nav-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    document.body.classList.toggle('nav-open');
  });
});

// Close mobile nav when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
  link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    document.querySelectorAll('.nav-toggle').forEach(b => b.setAttribute('aria-expanded','false'));
  });
});

// Fade-in animations on scroll
const fadeElems = document.querySelectorAll('.about-card, .skills-list, .projects-grid, .timeline, .contact-info, .contact-form, .footer-content');

const fadeInOnScroll = () => {
  fadeElems.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    }
  });
};

window.addEventListener('scroll', fadeInOnScroll);

document.addEventListener('DOMContentLoaded', () => {
  fadeElems.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(40px)';
  });
  fadeInOnScroll();
});

// Projects tag filter behavior
document.addEventListener('DOMContentLoaded', () => {
  const tagButtons = document.querySelectorAll('.projects-filter .tag');
  const projectCards = document.querySelectorAll('.projects-grid .project-card');

  function setActiveTag(btn) {
    tagButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  tagButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-tag');
      setActiveTag(btn);

      projectCards.forEach(card => {
        const img = card.querySelector('img');
        const tags = (img && img.getAttribute('data-tags')) ? img.getAttribute('data-tags').split(',') : [];
        if (tag === 'all') {
          card.classList.remove('hidden');
        } else {
          if (tags.map(t => t.trim()).includes(tag)) card.classList.remove('hidden'); else card.classList.add('hidden');
        }
      });
    });
  });
});

// Animate skill rings when they enter viewport
function animateSkillRings() {
  const rings = document.querySelectorAll('.skill-circle');
  rings.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      const pct = parseInt(el.getAttribute('data-percent') || '0', 10);
      const circle = el.querySelector('.ring');
      if (circle) {
        const radius = 36;
        const circumference = 2 * Math.PI * radius;
        const offset = Math.round(circumference * (1 - (pct / 100)));
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = offset;
        const valueEl = el.querySelector('.skill-value');
        if (valueEl) valueEl.textContent = pct + '%';
      }
    }
  });
}

window.addEventListener('scroll', animateSkillRings);
document.addEventListener('DOMContentLoaded', () => { animateSkillRings(); });

// Make skill circles accessible and support tap-to-toggle on touch devices
document.addEventListener('DOMContentLoaded', () => {
  const skillCircles = document.querySelectorAll('.skill-circle');
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

  skillCircles.forEach(el => {
    // Ensure keyboard focusable
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');

    // Toggle on Enter/Space for keyboard users
    el.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        el.classList.toggle('active');
      }
    });

    // On touch devices, toggle description on tap
    if (isTouch || window.innerWidth <= 520) {
      el.addEventListener('click', (ev) => {
        // toggle active state
        el.classList.toggle('active');
        // close others
        skillCircles.forEach(other => { if (other !== el) other.classList.remove('active'); });
      });
    }
  });

  // Close active skill when tapping outside
  document.addEventListener('click', (e) => {
    const inside = e.target.closest && e.target.closest('.skill-circle');
    if (!inside) document.querySelectorAll('.skill-circle.active').forEach(s => s.classList.remove('active'));
  });
});

// Contact Form Submission (POST to backend)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = this.querySelector('.submit-btn');
    const note = this.querySelector('.form-note');
    const nameEl = this.querySelector('[name="name"]');
    const emailEl = this.querySelector('[name="email"]');
    const subjectEl = this.querySelector('[name="subject"]');
    const messageEl = this.querySelector('[name="message"]');
    const name = nameEl ? nameEl.value.trim() : '';
    const email = emailEl ? emailEl.value.trim() : '';
    const subject = subjectEl ? subjectEl.value.trim() : '';
    const message = messageEl ? messageEl.value.trim() : '';

    if (!name || !email || !message) {
      if (note) note.textContent = 'Please fill required fields.';
      return;
    }

    try {
      btn.disabled = true;
      const origText = btn.textContent;
      btn.textContent = 'Sending...';

      // Use same-origin API path so frontend sends to the server serving the site.
      // This avoids mismatched ports (was previously pointing to :3001).
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      // Safely parse JSON only when response is JSON
      let data = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try { data = await res.json(); } catch (e) { data = {}; }
      }

      if (res.ok && data.success) {
        if (note) note.textContent = 'Message sent — thank you!';
        if (typeof this.reset === 'function') this.reset();
      } else {
        if (note) note.textContent = (data && data.error) ? data.error : ('Failed to send message. (' + res.status + ')');
      }

      if (btn) { btn.textContent = origText; btn.disabled = false; }
    } catch (err) {
      console.error('Contact send error:', err);
      if (note) note.textContent = 'Network error.';
      if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
    }
  });
}


// ---------------------------------------------
// ✅ Add this part: API message sender
// ---------------------------------------------
async function sendMessage() {
    const userMessage = document.getElementById("msg").value;

    const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
    });

    const data = await res.json();
    console.log("Backend reply:", data.reply);

    // OPTIONAL → Show reply on page
    const out = document.getElementById("ai-reply");
    if (out) out.textContent = data.reply;
}
