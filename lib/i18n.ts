export type Lang = "es" | "en";

export const translations = {
  es: {
    nav: {
      home:     "Inicio",
      about:    "Nosotros",
      services: "Servicios",
      clients:  "Clientes",
      contact:  "Contacto",
    },
    hero: {
      line1:    "Desarrollo web",
      line2:    "para tu negocio",
      sub:      "Somos un equipo consultor en tecnologías de la información, diseño web e imagen corporativa. Potenciamos tu negocio con soluciones digitales a medida.",
      cta1:     "Contáctanos",
      cta2:     "Proyectos",
    },
    about: {
      label:    "Quiénes somos",
      title:    "Tecnología que impulsa resultados",
      body:     "Somos un equipo consultor en tecnologías de la información, diseño y desarrollo web. Sabemos que los recursos informáticos impactan directamente en el logro de los objetivos del negocio. Por eso colaboramos con nuestros clientes para potenciar el aprovechamiento de sus recursos, trabajando con organizaciones pequeñas, medianas y grandes.",
      stat1v:   "+10",
      stat1l:   "Años de experiencia",
      stat2v:   "+30",
      stat2l:   "Proyectos entregados",
      stat3v:   "100%",
      stat3l:   "Enfoque en resultados",
    },
    services: {
      label:    "Servicios",
      title:    "¿En qué podemos ayudarte?",
      items: [
        {
          icon:  "🌐",
          title: "Desarrollo Web",
          desc:  "Desarrollamos tu sitio web pensando en el usuario final y los resultados que buscas. Desde landing pages hasta aplicaciones complejas.",
        },
        {
          icon:  "🎨",
          title: "Diseño & Marca",
          desc:  "Imagen corporativa, identidad visual y diseño UX/UI que comunica el valor de tu negocio de forma coherente y atractiva.",
        },
        {
          icon:  "⚙️",
          title: "Consultoría TI",
          desc:  "Te ayudamos a asegurar el buen funcionamiento de tu infraestructura tecnológica basado en estándares de la industria.",
        },
        {
          icon:  "📈",
          title: "Estrategia Digital",
          desc:  "Análisis, planeación y ejecución de estrategias digitales para mejorar tu presencia en línea y aumentar conversiones.",
        },
      ],
    },
    clients: {
      label: "Clientes",
      title: "Ellos han confiado en nosotros",
    },
    contact: {
      label:       "Contacto",
      title:       "Trabajemos juntos",
      sub:         "¿Tienes un proyecto en mente? Cuéntanos y encontraremos la mejor solución tecnológica para tu negocio.",
      name:        "Nombre completo",
      email:       "Correo electrónico",
      message:     "¿En qué podemos ayudarte?",
      submit:      "Enviar mensaje",
      sending:     "Enviando...",
      success:     "¡Mensaje enviado! Te contactaremos pronto.",
      error:       "Ocurrió un error. Intenta de nuevo.",
      namePlaceholder:    "Tu nombre",
      emailPlaceholder:   "tu@email.com",
      messagePlaceholder: "Cuéntanos sobre tu proyecto...",
    },
    footer: {
      tagline: "Mejoramos tu experiencia en tecnología",
      rights:  "Todos los derechos reservados.",
    },
  },
  en: {
    nav: {
      home:     "Home",
      about:    "About",
      services: "Services",
      clients:  "Clients",
      contact:  "Contact",
    },
    hero: {
      line1:    "Creative dev",
      line2:    "for your business",
      sub:      "We are an IT consulting team specializing in web design and corporate identity. We power your business with tailor-made digital solutions.",
      cta1:     "Contact us",
      cta2:     "Projects",
    },
    about: {
      label:    "Who we are",
      title:    "Technology that drives results",
      body:     "We are an IT consulting team specializing in information technology, web design and development. We know that technology resources directly impact business objectives. That is why we collaborate with our clients to maximize their resources, working with small, medium, and large organizations.",
      stat1v:   "+10",
      stat1l:   "Years of experience",
      stat2v:   "+30",
      stat2l:   "Projects delivered",
      stat3v:   "100%",
      stat3l:   "Results-driven",
    },
    services: {
      label:    "Services",
      title:    "How can we help you?",
      items: [
        {
          icon:  "🌐",
          title: "Web Development",
          desc:  "We build your website with the end user in mind. From landing pages to complex web applications.",
        },
        {
          icon:  "🎨",
          title: "Design & Branding",
          desc:  "Corporate identity, visual branding, and UX/UI design that communicates your business value clearly.",
        },
        {
          icon:  "⚙️",
          title: "IT Consulting",
          desc:  "We help ensure the proper functioning of your technology infrastructure based on industry standards.",
        },
        {
          icon:  "📈",
          title: "Digital Strategy",
          desc:  "Analysis, planning, and execution of digital strategies to improve your online presence and drive conversions.",
        },
      ],
    },
    clients: {
      label: "Clients",
      title: "They have trusted us",
    },
    contact: {
      label:       "Contact",
      title:       "Let's work together",
      sub:         "Have a project in mind? Tell us about it and we'll find the best tech solution for your business.",
      name:        "Full name",
      email:       "Email address",
      message:     "How can we help you?",
      submit:      "Send message",
      sending:     "Sending...",
      success:     "Message sent! We'll be in touch soon.",
      error:       "Something went wrong. Please try again.",
      namePlaceholder:    "Your name",
      emailPlaceholder:   "you@email.com",
      messagePlaceholder: "Tell us about your project...",
    },
    footer: {
      tagline: "We improve your technology experience",
      rights:  "All rights reserved.",
    },
  },
} as const;

export type Translations = typeof translations.es;
