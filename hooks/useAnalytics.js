import { useMemo } from "react";

export const useAnalytics = () => useMemo(() => {
  const trackEvent = (eventName, eventParams = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
  };

  const trackPropertyView = (property) => {
    trackEvent('property_view', {
      property_id: property.id,
      property_type: property.type,
      property_location: property.location,
      price: property.price || property.precioAlquilerARS,
      currency: property.modalidad === 'alquiler_permanente' ? 'ARS' : 'USD',
    });
  };

  const trackPropertyInquiry = (property, inquiryType = 'contact') => {
    trackEvent('generate_lead', {
      property_id: property.id,
      property_type: property.type,
      inquiry_type: inquiryType, // 'contact', 'whatsapp', 'email', 'phone'
      value: property.price || property.precioAlquilerARS,
      currency: property.modalidad === 'alquiler_permanente' ? 'ARS' : 'USD',
    });
  };

  const trackWhatsAppClick = (property = null, location = null) => {
    trackEvent('whatsapp_click', {
      ...(property && {
        property_id: property.id,
        property_type: property.type,
      }),
      ...(location && { location }),
    });
  };

  const trackNewsletterSignup = (interest = null) => {
    trackEvent('newsletter_signup', {
      ...(interest && { interest }),
    });
  };

  // Atribución liviana para entender desde qué campaña y ubicación interna
  // llega cada interacción con Radar SMA. Los parámetros solo se envían a GA4;
  // no incluyen datos personales ni se guardan en la base de suscriptores.
  const radarContext = (placement, interest = null) => {
    if (typeof window === 'undefined') return { placement };
    const params = new URLSearchParams(window.location.search);
    return {
      placement,
      page_path: window.location.pathname,
      source: params.get('utm_source') || 'direct',
      medium: params.get('utm_medium') || 'none',
      campaign: params.get('utm_campaign') || 'none',
      ...(interest && { interest }),
    };
  };

  const trackRadarView = (placement = 'unknown') => {
    trackEvent('radar_view', radarContext(placement));
  };

  const trackRadarSignupStart = (placement = 'unknown') => {
    trackEvent('radar_signup_start', radarContext(placement));
  };

  const trackRadarSignupComplete = (placement = 'unknown', interest = null) => {
    trackEvent('radar_signup_complete', radarContext(placement, interest));
  };

  const trackContactSubmit = () => {
    trackEvent('contact_submit', {});
  };

  const trackTasacionSubmit = ({ propertyType, zone } = {}) => {
    trackEvent('tasacion_submit', {
      ...(propertyType && { property_type: propertyType }),
      ...(zone && { zone }),
    });
  };

  const trackFavoriteToggle = (property, action) => {
    trackEvent('favorite_toggle', {
      property_id: property.id,
      property_type: property.type,
      action: action, // 'add' or 'remove'
    });
  };

  const trackPropertyShare = (property, method) => {
    trackEvent('property_share', {
      property_id: property.id,
      property_type: property.type,
      method: method, // 'whatsapp', 'email', 'copy_link'
    });
  };

  const trackFormSubmit = (formType, success = true) => {
    trackEvent('form_submit', {
      form_type: formType, // 'contact', 'tasacion', 'inquiry', 'newsletter'
      success: success,
    });
  };

  const trackFilterUse = (filterType, filterValue) => {
    trackEvent('filter_used', {
      filter_type: filterType, // 'type', 'price', 'bedrooms', etc.
      filter_value: filterValue,
    });
  };

  const trackMapInteraction = (action) => {
    trackEvent('map_interaction', {
      action: action, // 'zoom', 'pan', 'marker_click'
    });
  };

  return {
    trackEvent,
    trackPropertyView,
    trackPropertyInquiry,
    trackWhatsAppClick,
    trackNewsletterSignup,
    trackRadarView,
    trackRadarSignupStart,
    trackRadarSignupComplete,
    trackContactSubmit,
    trackTasacionSubmit,
    trackFavoriteToggle,
    trackPropertyShare,
    trackFormSubmit,
    trackFilterUse,
    trackMapInteraction,
  };
}, []);
