const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

function debounce(callback, delay = 150) {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    if (navLinks) {
      navLinks.classList.remove("show");
    }
  });
});

/* =========================
   FAST REVEAL ANIMATION
========================= */

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("active"));
}


/* PROJECT SLIDER */

const slider = document.getElementById("projectSlider");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

let autoSlide = null;
let isDown = false;
let startX = 0;
let scrollLeft = 0;
let userStoppedAuto = false;
let activeSlideTicking = false;

function isMobileOrReducedMotion() {
  return window.innerWidth <= 768 || reduceMotionQuery.matches;
}

function getSlideMoveAmount() {
  if (!slider) return 0;

  const slide = slider.querySelector(".premium-slide");
  if (!slide) return slider.clientWidth;

  const styles = window.getComputedStyle(slider);
  const gap = parseFloat(styles.columnGap || styles.gap) || 28;

  return slide.offsetWidth + gap;
}

function updateActiveSlide() {
  if (!slider) return;

  const slides = slider.querySelectorAll(".premium-slide");
  const sliderCenter = slider.scrollLeft + slider.offsetWidth / 2;

  slides.forEach((slide) => {
    const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
    const distance = Math.abs(sliderCenter - slideCenter);
    slide.classList.toggle("active", distance < slide.offsetWidth / 2);
  });
}

function requestActiveSlideUpdate() {
  if (activeSlideTicking) return;

  activeSlideTicking = true;

  requestAnimationFrame(() => {
    updateActiveSlide();
    activeSlideTicking = false;
  });
}

function slideNext() {
  if (!slider) return;

  const moveAmount = getSlideMoveAmount();

  if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth - 30) {
    slider.scrollTo({ left: 0, behavior: isMobileOrReducedMotion() ? "auto" : "smooth" });
  } else {
    slider.scrollBy({ left: moveAmount, behavior: isMobileOrReducedMotion() ? "auto" : "smooth" });
  }

  requestActiveSlideUpdate();
}

function slidePrev() {
  if (!slider) return;

  const moveAmount = getSlideMoveAmount();

  if (slider.scrollLeft <= 30) {
    slider.scrollTo({ left: slider.scrollWidth, behavior: isMobileOrReducedMotion() ? "auto" : "smooth" });
  } else {
    slider.scrollBy({ left: -moveAmount, behavior: isMobileOrReducedMotion() ? "auto" : "smooth" });
  }

  requestActiveSlideUpdate();
}

function startAutoSlide() {
  if (!slider || userStoppedAuto || isMobileOrReducedMotion()) return;

  stopAutoSlide();
  autoSlide = setInterval(slideNext, 5000);
}

function stopAutoSlide() {
  if (autoSlide) {
    clearInterval(autoSlide);
    autoSlide = null;
  }
}

function stopAutoForever() {
  userStoppedAuto = true;
  stopAutoSlide();
}

if (slider) {
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stopAutoForever();
      slideNext();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      stopAutoForever();
      slidePrev();
    });
  }

  slider.addEventListener("scroll", requestActiveSlideUpdate, { passive: true });
  slider.addEventListener("touchstart", stopAutoForever, { passive: true });
  slider.addEventListener("wheel", stopAutoForever, { passive: true });

  slider.addEventListener("mousedown", (event) => {
    isDown = true;
    startX = event.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    slider.classList.add("dragging");
    stopAutoForever();
  });

  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.classList.remove("dragging");
    requestActiveSlideUpdate();
  });

  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.classList.remove("dragging");
  });

  slider.addEventListener("mousemove", (event) => {
    if (!isDown) return;

    event.preventDefault();
    const x = event.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.2;
    slider.scrollLeft = scrollLeft - walk;
  });

  requestActiveSlideUpdate();
  startAutoSlide();
}

window.addEventListener(
  "resize",
  debounce(() => {
    stopAutoSlide();
    requestActiveSlideUpdate();
    startAutoSlide();
  }, 200),
  { passive: true }
);

if (typeof reduceMotionQuery.addEventListener === "function") {
  reduceMotionQuery.addEventListener("change", () => {
    stopAutoSlide();
    startAutoSlide();
  });
} else if (typeof reduceMotionQuery.addListener === "function") {
  reduceMotionQuery.addListener(() => {
    stopAutoSlide();
    startAutoSlide();
  });
  /* =========================
   MOBILE SLIDER DOTS
========================= */

const sliderDots = document.getElementById("sliderDots");

function createSliderDots() {
  if (!slider || !sliderDots) return;

  const slides = slider.querySelectorAll(".premium-slide");

  sliderDots.innerHTML = "";

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "slider-dot";

    dot.addEventListener("click", () => {
      const moveAmount = getSlideMoveAmount();

      slider.scrollTo({
        left: moveAmount * index,
        behavior: "smooth"
      });
    });

    sliderDots.appendChild(dot);
  });

  updateSliderDots();
}

function updateSliderDots() {
  if (!slider || !sliderDots) return;

  const slides = slider.querySelectorAll(".premium-slide");
  const dots = sliderDots.querySelectorAll(".slider-dot");

  const sliderCenter =
    slider.scrollLeft + slider.offsetWidth / 2;

  let activeIndex = 0;

  slides.forEach((slide, index) => {
    const slideCenter =
      slide.offsetLeft + slide.offsetWidth / 2;

    const distance = Math.abs(
      sliderCenter - slideCenter
    );

    if (distance < slide.offsetWidth / 2) {
      activeIndex = index;
    }
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle(
      "active",
      index === activeIndex
    );
  });
}

if (slider) {
  createSliderDots();

  slider.addEventListener(
    "scroll",
    updateSliderDots,
    { passive: true }
  );
}
}

/* PROJECT MODAL */

const modal = document.getElementById("projectModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");
const openModalButtons = document.querySelectorAll(".open-modal");

const projectData = {
  project1: {
    title: "Landing Page Development",
    subtitle: "Initiative 01",
    images: ["images/project-1.jpg"],
    overview:
      "Developed and maintained 70+ high-converting landing pages to support student lead generation campaigns. The pages were built with conversion-focused UX, Salesforce form integration, and automated tracking.",
    role:
      "Landing page development, UX improvement, Salesforce form integration, tracking setup, and lead capture optimization.",
    tools:
      "WordPress, Oxygen, Elementor, Salesforce CRM, Google Tag Manager, GA4.",
    result:
      "20% improvement in lead capture efficiency and stronger landing page conversion performance."
  },

project2: {
  title: "Campaign Management",
  subtitle: "Initiative 02",
  images: [
    "images/project-2-1.jpg",
    "images/project-2-2.jpg",
    "images/project-2-3.jpg"
  ],
  overview:
    "Managed more than 60 multi-channel advertising campaigns across Google Ads, Meta Ads, LinkedIn Ads, and TikTok Ads.",
  role:
    "Campaign planning, targeting, budget optimization, A/B testing, and performance tracking.",
  tools:
    "Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads, GA4, Google Tag Manager.",
  result:
    "18% higher ROAS and 25% increase in qualified leads."
  },

  project3: {
    title: "AI Chatbot Automation",
    subtitle: "Initiative 03",
    images: ["images/project-3.jpg"],
    overview:
      "Implemented a WhatsApp AI Agent automation system using SleekFlow to improve lead engagement, qualification flow, and response efficiency.",
    role:
      "Automation workflow planning, chatbot logic setup, lead response mapping, and performance monitoring.",
    tools:
      "SleekFlow, WhatsApp automation, AI chatbot workflows.",
    result:
      "30% increase in lead engagement and reduced manual follow-up effort by 10 hours weekly."
  },

  project4: {
    title: "Email Automation Integration",
    subtitle: "Initiative 04",
    images: ["images/project-4.jpg"],
    overview:
      "Built segmented email marketing workflows with automation and A/B testing to improve nurturing, campaign engagement, and follow-up communication.",
    role:
      "Email campaign setup, segmentation, automation planning, content testing, and performance tracking.",
    tools:
      "MailerLite, Constant Contact, email automation, A/B testing.",
    result:
      "15% higher open rates and 10% higher click-through rates."
  },

  project5: {
    title: "Marketing Analytics Infrastructure",
    subtitle: "Initiative 05",
    images: ["images/project-5.jpg"],
    overview:
      "Implemented end-to-end marketing tracking infrastructure to improve campaign visibility, attribution accuracy, and reporting clarity.",
    role:
      "Tracking setup, event configuration, conversion tracking, pixel implementation, and reporting structure.",
    tools:
      "Google Tag Manager, GA4, Meta Pixel, Google Ads Conversion Tracking, Conversion APIs, Google Search Console, Power BI.",
    result:
      "Improved attribution accuracy, better decision-making, and clearer campaign performance reporting."
  },

project6: {
  title: "SEO Performance Optimization",
  subtitle: "Initiative 06",
  images: ["images/project-6.jpg", "images/project-6-1.jpg"],

  overview:
    "Analyzed and optimized non-branded keyword performance to improve organic visibility across high-intent education search terms. The project focused on keyword ranking movement, search volume analysis, SERP changes, and ongoing SEO performance monitoring.",
  role:
    "SEO performance analysis, keyword tracking, ranking movement review, search intent evaluation, on-page SEO recommendations, and monthly reporting insights.",
  tools:
    "Google Search Console, SEMrush, GA4, keyword ranking reports, and SEO performance dashboards.",
  result:
    "Tracked 76 keywords ranking in the Top 10, maintained strong visibility for high-volume terms such as MBA, and identified ranking gains across diploma and postgraduate-related keywords."
}
};

function openProjectModal(projectKey) {
  const project = projectData[projectKey];

  if (!project) return;

  const imagesHtml =
    project.images.length > 1
      ? `
        <div class="modal-gallery">
          ${project.images
            .map(
              (image) =>
                `<img src="${image}" alt="${project.title} evidence image" loading="lazy" decoding="async" />`
            )
            .join("")}
        </div>
      `
      : `<img class="modal-image-large" src="${project.images[0]}" alt="${project.title} evidence image" loading="lazy" decoding="async" />`;

  modalBody.innerHTML = `
    <div class="modal-project">
      <p class="project-number">${project.subtitle}</p>
      <h2>${project.title}</h2>
      ${imagesHtml}

      <p>${project.overview}</p>

      <div class="modal-info-grid">
        <div class="modal-info-card">
          <h4>My Role</h4>
          <p>${project.role}</p>
        </div>

        <div class="modal-info-card">
          <h4>Tools Used</h4>
          <p>${project.tools}</p>
        </div>

        <div class="modal-info-card">
          <h4>Result</h4>
          <p>${project.result}</p>
        </div>
      </div>
    </div>
  `;

  if (modal) {
    modal.classList.add("show");
    document.body.classList.add("modal-open");
  }
}

openModalButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const projectKey = button.getAttribute("data-project");
    openProjectModal(projectKey);
  });
});

function closeModal() {
  if (modal) {
    modal.classList.remove("show");
    document.body.classList.remove("modal-open");
  }
}

if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

/* EXPERIENCE TIMELINE SCROLL PROGRESS */

const experienceTimeline = document.getElementById("experienceTimeline");
const experienceLineProgress = document.getElementById("experienceLineProgress");
const experienceItems = document.querySelectorAll(".experience-scroll-item");
let experienceTimelineTicking = false;

function updateExperienceTimeline() {
  if (!experienceTimeline || !experienceLineProgress) return;

  const rect = experienceTimeline.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const start = windowHeight * 0.75;
  const end = Math.max(rect.height - windowHeight * 0.25, 1);

  let progress = (start - rect.top) / end;
  progress = Math.max(0, Math.min(progress, 1));

  experienceLineProgress.style.height = `${progress * 100}%`;

  experienceItems.forEach((item) => {
    const itemRect = item.getBoundingClientRect();
    const itemCenter = itemRect.top + itemRect.height / 2;

    item.classList.toggle("is-active", itemCenter < windowHeight * 0.65);
  });
}

function requestExperienceTimelineUpdate() {
  if (experienceTimelineTicking) return;

  experienceTimelineTicking = true;

  requestAnimationFrame(() => {
    updateExperienceTimeline();
    experienceTimelineTicking = false;
  });
}

window.addEventListener("scroll", requestExperienceTimelineUpdate, { passive: true });
window.addEventListener("load", requestExperienceTimelineUpdate);
window.addEventListener("resize", debounce(requestExperienceTimelineUpdate, 150), { passive: true });


// your existing code above...



/* =========================
   KPI COUNT-UP ANIMATION
========================= */

const kpiCounters = document.querySelectorAll(".kpi-number");
let kpiAnimated = false;

function animateKpiCounters() {
  kpiCounters.forEach((counter) => {
    const target = parseFloat(counter.getAttribute("data-target"));
    let current = 0;
    const duration = isMobileOrReducedMotion() ? 700 : 1400;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      current = target * easedProgress;

      if (target % 1 !== 0) {
        counter.innerText = current.toFixed(1);
      } else {
        counter.innerText = Math.round(current);
      }

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counter.innerText = target % 1 !== 0 ? target.toFixed(1) : target;
      }
    }

    requestAnimationFrame(updateCounter);
  });
}

function triggerKpiCounters() {
  if (kpiAnimated || kpiCounters.length === 0) return;

  animateKpiCounters();
  kpiAnimated = true;
}

const achievementsSection = document.getElementById("achievements");

if (achievementsSection && "IntersectionObserver" in window) {
  const kpiObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          triggerKpiCounters();
          kpiObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.25
    }
  );

  kpiObserver.observe(achievementsSection);
} else {
  window.addEventListener("load", triggerKpiCounters);
}


/* =========================
   HERO BACKGROUND + TEXT GLOW
========================= */

const heroVideo = document.querySelector(".hero-bg-video");
const heroVideoSource = heroVideo ? heroVideo.querySelector("source") : null;
const heroMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function shouldLoadHeroVideo() {
  return window.innerWidth > 768 && !heroMotionQuery.matches;
}

function setupHeroVideo() {
  if (!heroVideo || !heroVideoSource) return;

  const videoSrc = heroVideoSource.dataset.src || heroVideoSource.getAttribute("src");

  if (shouldLoadHeroVideo() && videoSrc) {
    if (!heroVideoSource.getAttribute("src")) {
      heroVideoSource.setAttribute("src", videoSrc);
      heroVideo.load();
    }

    const playPromise = heroVideo.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  } else {
    heroVideo.pause();
    heroVideo.removeAttribute("src");
    heroVideoSource.removeAttribute("src");
    heroVideo.load();
  }
}

setupHeroVideo();
window.addEventListener("load", setupHeroVideo);
window.addEventListener("resize", debounce(setupHeroVideo, 250), { passive: true });

if (typeof heroMotionQuery.addEventListener === "function") {
  heroMotionQuery.addEventListener("change", setupHeroVideo);
} else if (typeof heroMotionQuery.addListener === "function") {
  heroMotionQuery.addListener(setupHeroVideo);
}

const canUseHoverEffects = window.matchMedia("(hover: hover) and (pointer: fine)");

/* Background glow - desktop only */
const hero = document.querySelector(".premium-video-hero");

if (hero && canUseHoverEffects.matches) {
  let heroPointerFrame = null;
  let lastHeroEvent = null;

  hero.addEventListener(
    "mousemove",
    (event) => {
      lastHeroEvent = event;

      if (heroPointerFrame) return;

      heroPointerFrame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = lastHeroEvent.clientX - rect.left;
        const y = lastHeroEvent.clientY - rect.top;

        hero.style.setProperty("--mouse-x", `${x}px`);
        hero.style.setProperty("--mouse-y", `${y}px`);

        heroPointerFrame = null;
      });
    },
    { passive: true }
  );
}

/* Heading text glow - desktop only */
const heroHeading = document.querySelector(".hero-highlight-heading");

if (heroHeading && canUseHoverEffects.matches) {
  let headingPointerFrame = null;
  let lastHeadingEvent = null;

  heroHeading.addEventListener(
    "mousemove",
    (event) => {
      lastHeadingEvent = event;

      if (headingPointerFrame) return;

      headingPointerFrame = requestAnimationFrame(() => {
        const rect = heroHeading.getBoundingClientRect();
        const x = ((lastHeadingEvent.clientX - rect.left) / rect.width) * 100;
        const y = ((lastHeadingEvent.clientY - rect.top) / rect.height) * 100;

        heroHeading.style.setProperty("--text-x", `${x}%`);
        heroHeading.style.setProperty("--text-y", `${y}%`);

        headingPointerFrame = null;
      });
    },
    { passive: true }
  );
}


/* =========================
   FLOATING AI CHATBOT
========================= */

const aiChatToggle = document.getElementById("aiChatToggle");
const aiChatPanel = document.getElementById("aiChatPanel");
const aiChatClose = document.getElementById("aiChatClose");
const aiChatBody = document.getElementById("aiChatBody");
const aiChatInput = document.getElementById("aiChatInput");
const aiSendBtn = document.getElementById("aiSendBtn");
const aiSuggestionBox = document.getElementById("aiSuggestionBox");

let lastAiIntent = null;

const aiResponses = {
  experience:
    `Kunalan is a Senior Digital Marketing Executive with experience in:

• Paid media across Google, Meta, TikTok, and LinkedIn
• Lead generation funnel strategy
• Landing page optimization and CRO
• Marketing automation and CRM workflows
• Analytics, tracking, and campaign reporting
• Managed 60+ campaigns and RM1.8M+ ad budget`,

  projects:
    `Key projects include:

• Landing page development
• Multi-channel campaign management
• AI WhatsApp automation
• Email automation integration
• Marketing analytics infrastructure
• SEO performance optimization

You can view more under the Projects section.`,

  results:
    `Key performance impact:

• +21.5% YoY lead growth
• -10% lower CPL
• +8% conversion rate improvement
• +17% ROAS improvement
• +30% lead engagement through automation`,

  skills:
    `Kunalan works with:

• Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads
• GA4, Google Tag Manager, Meta Pixel, Conversion API
• Salesforce, SleekFlow, WhatsApp AI automation
• WordPress, Elementor, Oxygen
• SEMrush, Power BI, Canva, AI tools`,

  cv:
    `You can download Kunalan’s CV here:

[Download CV](assets/CV-2026.pdf)`,

  contact:
    `You can contact Kunalan through:

[Email](mailto:kunalan517@gmail.com)
[LinkedIn](https://www.linkedin.com/in/kunalan-mahendran/)
[WhatsApp](https://wa.me/60162507723?text=Hi%20Kunalan%2C%20I%20found%20your%20portfolio%20and%20would%20like%20to%20connect.)`
};

function addAiMessage(text, sender = "bot") {
  if (!aiChatBody) return;

  const message = document.createElement("div");
  message.className = `ai-message ${sender}`;

  if (sender === "bot") {
    message.innerHTML = text
      .replace(/\n/g, "<br>")
      .replace(/\[Download CV\]\((.*?)\)/g, '<a class="ai-message-btn" href="$1" download>Download CV</a>')
      .replace(/\[Email\]\((.*?)\)/g, '<a class="ai-message-btn" href="$1">Email</a>')
      .replace(/\[LinkedIn\]\((.*?)\)/g, '<a class="ai-message-btn" href="$1" target="_blank">LinkedIn</a>')
      .replace(/\[WhatsApp\]\((.*?)\)/g, '<a class="ai-message-btn" href="$1" target="_blank">WhatsApp</a>');
  } else {
    message.innerText = text;
  }

  aiChatBody.appendChild(message);
  aiChatBody.scrollTop = aiChatBody.scrollHeight;
}

function getFollowUpResponse(intent) {
  const followUps = {
    experience:
      `More about Kunalan’s experience:

• Focuses on full-funnel digital marketing
• Works across paid media, automation, CRO, and analytics
• Has experience in education and lead generation campaigns
• Builds landing pages, reporting systems, and campaign workflows`,

    projects:
      `More project details:

• Landing pages connected with Salesforce forms
• Multi-channel paid ads across Google, Meta, TikTok, and LinkedIn
• WhatsApp AI automation using SleekFlow
• GA4, GTM, Meta Pixel, and Conversion API tracking setup
• SEO keyword tracking and ranking performance reports`,

    results:
      `Additional performance highlights:

• Managed RM1.8M+ ad budget
• Supported 5 institution websites
• Managed 60+ campaigns
• Improved lead quality and tracking visibility
• Strengthened reporting for better marketing decisions`,

    skills:
      `More skills include:

• Paid media planning and optimization
• Landing page UX and CRO
• Email automation and CRM workflows
• Analytics dashboards and campaign reporting
• SEO visibility and keyword performance tracking`,

    cv: aiResponses.cv,

    contact: aiResponses.contact
  };

  return followUps[intent] || "Tell me which area you want to know more about: experience, projects, results, skills, CV, or contact.";
}

function getAiResponse(input) {
  const text = input.toLowerCase();

  const followUpWords = [
    "tell me more",
    "more",
    "details",
    "show more",
    "explain",
    "what else",
    "continue"
  ];

  if (followUpWords.some((word) => text.includes(word)) && lastAiIntent) {
    return getFollowUpResponse(lastAiIntent);
  }

  const intentMap = [
    {
      intent: "experience",
      keys: ["experience", "background", "work", "career", "what does he do", "who is", "about him"],
      response: aiResponses.experience
    },
    {
      intent: "projects",
      keys: ["project", "projects", "case study", "portfolio", "what has he built", "what did he do"],
      response: aiResponses.projects
    },
    {
      intent: "results",
      keys: ["result", "results", "achievement", "performance", "kpi", "growth", "roas", "conversion", "leads", "cpl"],
      response: aiResponses.results
    },
    {
      intent: "skills",
      keys: ["skill", "skills", "tools", "platform", "software", "google ads", "meta ads", "tiktok ads", "linkedin ads", "analytics", "ga4", "gtm", "seo", "automation", "crm"],
      response: aiResponses.skills
    },
    {
      intent: "cv",
      keys: ["cv", "resume", "download cv", "download resume"],
      response: aiResponses.cv
    },
    {
      intent: "contact",
      keys: ["contact", "email", "reach", "hire", "whatsapp", "linkedin", "how to contact", "how to reach"],
      response: aiResponses.contact
    }
  ];

  for (let intent of intentMap) {
    for (let key of intent.keys) {
      if (text.includes(key)) {
        lastAiIntent = intent.intent;
        return intent.response;
      }
    }
  }

  return `I can help with:

• Experience
• Projects
• Results
• Skills
• CV
• Contact

Try asking: "what results did he achieve?" or "what tools does he use?"`;
}

function sendAiMessage() {
  if (!aiChatInput) return;

  const value = aiChatInput.value.trim();
  if (!value) return;

  addAiMessage(value, "user");
  aiChatInput.value = "";

  if (aiSuggestionBox) {
    aiSuggestionBox.classList.remove("show");
    aiSuggestionBox.innerHTML = "";
  }

  setTimeout(() => {
    addAiMessage(getAiResponse(value), "bot");
  }, 300);
}

const aiSuggestions = [
  "What results did he achieve?",
  "What projects has he done?",
  "What tools does he use?",
  "Can he manage Google Ads?",
  "Tell me about automation",
  "How can I contact him?",
  "Download CV"
];

function updateAiSuggestions(value) {
  if (!aiSuggestionBox) return;

  const text = value.toLowerCase().trim();

  if (!text) {
    aiSuggestionBox.classList.remove("show");
    aiSuggestionBox.innerHTML = "";
    return;
  }

  const filtered = aiSuggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(text) ||
    (text.includes("ad") && suggestion.toLowerCase().includes("google ads")) ||
    (text.includes("tool") && suggestion.toLowerCase().includes("tools")) ||
    (text.includes("contact") && suggestion.toLowerCase().includes("contact")) ||
    (text.includes("cv") && suggestion.toLowerCase().includes("cv"))
  );

  aiSuggestionBox.innerHTML = "";

  filtered.slice(0, 3).forEach((suggestion) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerText = suggestion;

    button.addEventListener("click", () => {
      if (!aiChatInput) return;

      aiChatInput.value = suggestion;
      aiSuggestionBox.classList.remove("show");
      aiSuggestionBox.innerHTML = "";
      sendAiMessage();
    });

    aiSuggestionBox.appendChild(button);
  });

  if (filtered.length > 0) {
    aiSuggestionBox.classList.add("show");
  } else {
    aiSuggestionBox.classList.remove("show");
  }
}

if (aiChatToggle && aiChatPanel) {
  aiChatToggle.addEventListener("click", () => {
    aiChatPanel.classList.toggle("show");

    if (aiChatPanel.classList.contains("show")) {
      document.body.classList.add("ai-chat-open");
    } else {
      document.body.classList.remove("ai-chat-open");
    }
  });
}

if (aiChatClose && aiChatPanel) {
  aiChatClose.addEventListener("click", () => {
    aiChatPanel.classList.remove("show");
    document.body.classList.remove("ai-chat-open");
  });
}

document.querySelectorAll("[data-ai]").forEach((button) => {
  button.addEventListener("click", () => {
    const key = button.getAttribute("data-ai");
    const label = button.innerText;

    if (!aiResponses[key]) return;

    lastAiIntent = key;
    addAiMessage(label, "user");

    setTimeout(() => {
      addAiMessage(aiResponses[key], "bot");
    }, 300);
  });
});

if (aiSendBtn) {
  aiSendBtn.addEventListener("click", sendAiMessage);
}

if (aiChatInput) {
  aiChatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendAiMessage();
    }
  });

  aiChatInput.addEventListener("input", () => {
    updateAiSuggestions(aiChatInput.value);
  });
}

if (aiChatBody) {
  aiChatBody.addEventListener(
    "wheel",
    (event) => {
      const atTop = aiChatBody.scrollTop === 0;
      const atBottom =
        Math.ceil(aiChatBody.scrollTop + aiChatBody.clientHeight) >=
        aiChatBody.scrollHeight;

      if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
        event.preventDefault();
      }

      event.stopPropagation();
    },
    { passive: false }
  );

  aiChatBody.addEventListener(
    "touchmove",
    (event) => {
      event.stopPropagation();
    },
    { passive: true }
  );
}
