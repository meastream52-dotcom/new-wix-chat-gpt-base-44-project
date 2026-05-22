/* =============================================
   EBook Publishing Profs – Main JS
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Sticky header --- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
    scrollTopBtn?.classList.toggle('visible', window.scrollY > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- Mobile nav toggle --- */
  const navToggle = document.querySelector('.nav-toggle');
  const body = document.body;
  navToggle?.addEventListener('click', () => {
    body.classList.toggle('mobile-nav-open');
    const open = body.classList.contains('mobile-nav-open');
    navToggle.setAttribute('aria-expanded', open);
  });

  /* --- Mobile dropdown toggle --- */
  document.querySelectorAll('.nav-link.has-dropdown').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 768 && body.classList.contains('mobile-nav-open')) {
        e.preventDefault();
        link.closest('.nav-item')?.classList.toggle('open');
      }
    });
  });

  /* Close mobile nav on outside click */
  document.addEventListener('click', (e) => {
    if (body.classList.contains('mobile-nav-open') && !e.target.closest('.nav-wrapper')) {
      body.classList.remove('mobile-nav-open');
    }
  });

  /* --- Scroll to top --- */
  const scrollTopBtn = document.querySelector('.scroll-top');
  scrollTopBtn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* --- FAQ accordion --- */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* --- Portfolio filter --- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      portfolioItems.forEach(item => {
        if (cat === 'all' || item.dataset.cat === cat) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  /* --- Contact form submit (demo) --- */
  const contactForm = document.querySelector('.contact-form form');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = 'Message Sent! ✓';
      btn.style.background = '#28a745';
      contactForm.reset();
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.style.background = '';
        btn.disabled = false;
      }, 3000);
    }, 1200);
  });

  /* --- Animate numbers on scroll --- */
  const counters = document.querySelectorAll('.number[data-count]');
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const increment = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current.toLocaleString() + suffix;
    }, 25);
  };
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => obs.observe(c));
  } else {
    counters.forEach(animateCounter);
  }

  /* --- Active nav link --- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* --- Smooth reveal on scroll --- */
  const reveals = document.querySelectorAll('.service-card, .feature-item, .testimonial-card, .blog-card, .pricing-card, .team-card, .portfolio-item');
  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'fadeInUp 0.5s ease forwards';
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => {
      el.style.opacity = '0';
      revealObs.observe(el);
    });
  }
});

/* Keyframe for reveal */
const style = document.createElement('style');
style.textContent = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}`;
document.head.appendChild(style);
