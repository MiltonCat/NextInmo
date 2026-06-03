export const useAnalytics = () => {
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

  const trackWhatsAppClick = (property = null) => {
    trackEvent('whatsapp_click', {
      ...(property && {
        property_id: property.id,
        property_type: property.type,
      }),
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
    trackFavoriteToggle,
    trackPropertyShare,
    trackFormSubmit,
    trackFilterUse,
    trackMapInteraction,
  };
};
