// Portfolio of Omkar Kaunsalye - script.js

// Typing effect for hero section
const typedText = [
  'AI/ML Engineer',
  'Full Stack Developer',
  'Web Enthusiast',
  'Open to Opportunities'
];
let typedIndex = 0, charIndex = 0, isDeleting = false;
const typedElem = document.getElementById('typed');

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

document.addEventListener('DOMContentLoaded', type);

// Smooth scroll for nav links
document.querySelectorAll('.navbar a, .footer-links a').forEach(link => {
  link.addEventListener('click', function(e) {
    if (this.hash && document.querySelector(this.hash)) {
      e.preventDefault();
      document.querySelector(this.hash).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Light/Dark theme toggle
const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
  themeBtn.textContent = document.body.classList.contains('light') ? '🌞' : '🌙';
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

// Contact Form Submission (POST to backend)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = this.querySelector('.submit-btn');
    const note = this.querySelector('.form-note');
    const name = this.querySelector('[name="name"]').value.trim();
    const email = this.querySelector('[name="email"]').value.trim();
    const subject = this.querySelector('[name="subject"]').value.trim();
    const message = this.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      if (note) note.textContent = 'Please fill required fields.';
      return;
    }

    try {
      btn.disabled = true;
      const origText = btn.textContent;
      btn.textContent = 'Sending...';

      const backendUrl = 'http://localhost:3001';
      const res = await fetch(backendUrl + '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (note) note.textContent = 'Message sent — thank you!';
        this.reset();
      } else {
        if (note) note.textContent = data.error || 'Failed to send message.';
      }

      btn.textContent = origText;
      btn.disabled = false;
    } catch (err) {
      console.error('Contact send error:', err);
      if (this.querySelector('.form-note')) this.querySelector('.form-note').textContent = 'Network error.';
      btn.disabled = false;
      btn.textContent = 'Send Message';
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
