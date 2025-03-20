export const translations = {
  en: {
    // Common
    "common.next": "Next",
    "common.previous": "Previous",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.add": "Add",
    "common.edit": "Edit",
    "common.remove": "Remove",
    "common.years": "years",
    
    // Form steps
    "step.personal_info": "Personal Information",
    "step.residence_history": "Residence History",
    "step.employment_history": "Employment History",
    "step.education": "Education",
    "step.professional_licenses": "Professional Licenses",
    "step.consents": "Consents",
    "step.signature": "Review & Sign",
    
    // Residence History
    "residence.title": "Residence History",
    "residence.intro": "Please provide your complete residence history for the past {{years}} years, beginning with your current or most recent address.",
    "residence.progress": "{{current}} / {{required}} years",
    "residence.entries_title": "Your Residences",
    "residence.add_title": "Add Residence",
    "residence.add_button": "Add Residence",
    "residence.address": "Street Address",
    "residence.city": "City",
    "residence.state_province": "State/Province",
    "residence.zip_postal": "ZIP/Postal Code",
    "residence.country": "Country",
    "residence.start_date": "Start Date",
    "residence.end_date": "End Date",
    "residence.is_current": "I currently live at this address",
    "residence.save_button": "Save Residence",
    
    // Employment History
    "employment.title": "Employment History",
    "employment.intro": "Please provide your complete employment history for the past {{years}} years, beginning with your current or most recent position.",
    "employment.progress": "Progress",
    "employment.progress_label": "{{years}} / {{required}} years",
    "employment.select_type": "Select Type",
    "employment.entries_title": "Your Employment History",
    "employment.add_title": "Add Employment",
    "employment.add_button": "Add Employment Entry",
    "employment.type": "Entry Type",
    "employment.type_job": "Job",
    "employment.type_education": "Education",
    "employment.type_unemployed": "Unemployed",
    "employment.type_other": "Other",
    "employment.company": "Company/Organization",
    "employment.position": "Position/Title",
    "employment.city": "City",
    "employment.state_province": "State/Province",
    "employment.description": "Description",
    "employment.contact_name": "Contact Name",
    "employment.contact_info": "Contact Information",
    "employment.start_date": "Start Date",
    "employment.end_date": "End Date",
    "employment.is_current_job": "I currently work here",
    "employment.is_current_education": "I am currently studying here",
    "employment.is_current_generic": "This is my current status",
    "employment.save_button": "Save Entry",
    "employment.description_job": "Describe your responsibilities and achievements",
    "employment.description_education": "Describe your education during this period",
    "employment.description_unemployed": "Explain your activities during this period",
    "employment.description_other": "Describe this period",
    "employment.contact_name_placeholder": "Name and title of reference",
    "employment.contact_info_placeholder": "Email or phone number",
    
    // Navigation
    "navigation.form_controls": "Form Controls",
    "navigation.previous_step": "Go to previous step",
    "navigation.next_step": "Go to next step",
    
    // Validation
    "validation.required": "This field is required",
    "validation.min_years": "Please provide at least {{required}} years of history. Currently: {{current}} years.",
    "validation.date_order": "End date must be after start date",
    "validation.date_overlap": "Dates cannot overlap with other entries",
    
    // Timeline
    "timeline.progress": "{{current}} / {{required}} years",
    "timeline.progress_label": "Years accounted for",
    "timeline.gap": "Gap in history",
    "timeline.gap_description": "Gap in history ({{percentage}}% of timeline)",
    "common.present": "Present"
  },
  
  es: {
    // Common
    "common.next": "Siguiente",
    "common.previous": "Anterior",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.add": "Añadir",
    "common.edit": "Editar",
    "common.remove": "Eliminar",
    "common.years": "años",
    
    // Form steps
    "step.personal_info": "Información Personal",
    "step.residence_history": "Historial de Residencia",
    "step.employment_history": "Historial de Empleo",
    "step.education": "Educación",
    "step.professional_licenses": "Licencias Profesionales",
    "step.consents": "Consentimientos",
    "step.signature": "Revisar y Firmar",
    
    // Residence History
    "residence.title": "Historial de Residencia",
    "residence.intro": "Por favor proporcione su historial completo de residencia durante los últimos {{years}} años, comenzando con su dirección actual o más reciente.",
    "residence.progress": "{{current}} / {{required}} años",
    "residence.entries_title": "Sus Residencias",
    "residence.add_title": "Añadir Residencia",
    "residence.add_button": "Añadir Residencia",
    "residence.address": "Dirección",
    "residence.city": "Ciudad",
    "residence.state_province": "Estado/Provincia",
    "residence.zip_postal": "Código Postal",
    "residence.country": "País",
    "residence.start_date": "Fecha de Inicio",
    "residence.end_date": "Fecha de Finalización",
    "residence.is_current": "Actualmente vivo en esta dirección",
    "residence.save_button": "Guardar Residencia",
    
    // Employment History
    "employment.title": "Historial de Empleo",
    "employment.intro": "Por favor proporcione su historial completo de empleo durante los últimos {{years}} años, comenzando con su posición actual o más reciente.",
    "employment.progress": "{{current}} / {{required}} años",
    "employment.progress_label": "Progreso hacia {{required}} años de historial de empleo",
    "employment.select_type": "Seleccionar Tipo",
    "employment.entries_title": "Su Historial de Empleo",
    "employment.add_title": "Añadir Empleo",
    "employment.add_button": "Añadir Entrada de Empleo",
    "employment.type": "Tipo de Entrada",
    "employment.type_job": "Trabajo",
    "employment.type_education": "Educación",
    "employment.type_unemployed": "Desempleado",
    "employment.type_other": "Otro",
    "employment.company": "Empresa/Organización",
    "employment.position": "Posición/Título",
    "employment.city": "Ciudad",
    "employment.state_province": "Estado/Provincia",
    "employment.description": "Descripción",
    "employment.contact_name": "Nombre de Contacto",
    "employment.contact_info": "Información de Contacto",
    "employment.start_date": "Fecha de Inicio",
    "employment.end_date": "Fecha de Finalización",
    "employment.is_current_job": "Actualmente trabajo aquí",
    "employment.is_current_education": "Actualmente estudio aquí",
    "employment.is_current_generic": "Este es mi estado actual",
    "employment.save_button": "Guardar Entrada",
    "employment.description_job": "Describa sus responsabilidades y logros",
    "employment.description_education": "Describa su educación durante este período",
    "employment.description_unemployed": "Explique sus actividades durante este período",
    "employment.description_other": "Describa este período",
    "employment.contact_name_placeholder": "Nombre y título de referencia",
    "employment.contact_info_placeholder": "Correo electrónico o número de teléfono",
    
    // Navigation
    "navigation.form_controls": "Navegación del formulario",
    "navigation.previous_step": "Ir al paso anterior",
    "navigation.next_step": "Ir al siguiente paso",
    
    // Validation
    "validation.required": "Este campo es obligatorio",
    "validation.min_years": "Por favor proporcione al menos {{required}} años de historial. Actualmente: {{current}} años.",
    "validation.date_order": "La fecha de finalización debe ser posterior a la fecha de inicio",
    "validation.date_overlap": "Las fechas no pueden superponerse con otras entradas",
    
    // Timeline
    "timeline.progress": "{{current}} / {{required}} años",
    "timeline.progress_label": "Años contabilizados",
    "timeline.gap": "Hueco en el historial",
    "timeline.gap_description": "Hueco en el historial ({{percentage}}% de la línea de tiempo)",
    "common.present": "Presente"
  },
  
  fr: {
    // Common
    "common.next": "Suivant",
    "common.previous": "Précédent",
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.add": "Ajouter",
    "common.edit": "Modifier",
    "common.remove": "Supprimer",
    "common.years": "ans",
    
    // Form steps
    "step.personal_info": "Informations Personnelles",
    "step.residence_history": "Historique de Résidence",
    "step.employment_history": "Historique d'Emploi",
    "step.education": "Éducation",
    "step.professional_licenses": "Licences Professionnelles",
    "step.consents": "Consentements",
    "step.signature": "Révision et Signature",
    
    // Residence History
    "residence.title": "Historique de Résidence",
    "residence.intro": "Veuillez fournir votre historique complet de résidence pour les {{years}} dernières années, en commençant par votre adresse actuelle ou la plus récente.",
    "residence.progress": "{{current}} / {{required}} ans",
    "residence.entries_title": "Vos Résidences",
    "residence.add_title": "Ajouter une Résidence",
    "residence.add_button": "Ajouter une Résidence",
    "residence.address": "Adresse",
    "residence.city": "Ville",
    "residence.state_province": "État/Province",
    "residence.zip_postal": "Code Postal",
    "residence.country": "Pays",
    "residence.start_date": "Date de Début",
    "residence.end_date": "Date de Fin",
    "residence.is_current": "J'habite actuellement à cette adresse",
    "residence.save_button": "Enregistrer la Résidence",
    
    // Employment History
    "employment.title": "Historique d'Emploi",
    "employment.intro": "Veuillez fournir votre historique complet d'emploi pour les {{years}} dernières années, en commençant par votre poste actuel ou le plus récent.",
    "employment.progress": "{{current}} / {{required}} ans",
    "employment.progress_label": "Progreso hacia {{required}} años de historial de empleo",
    "employment.select_type": "Seleccionar Tipo",
    "employment.entries_title": "Votre Historique d'Emploi",
    "employment.add_title": "Ajouter un Emploi",
    "employment.add_button": "Ajouter une Entrée d'Emploi",
    "employment.type": "Type d'Entrée",
    "employment.type_job": "Emploi",
    "employment.type_education": "Éducation",
    "employment.type_unemployed": "Sans Emploi",
    "employment.type_other": "Autre",
    "employment.company": "Entreprise/Organisation",
    "employment.position": "Poste/Titre",
    "employment.city": "Ville",
    "employment.state_province": "État/Province",
    "employment.description": "Description",
    "employment.contact_name": "Nom du Contact",
    "employment.contact_info": "Informations de Contact",
    "employment.start_date": "Date de Début",
    "employment.end_date": "Date de Fin",
    "employment.is_current_job": "Je travaille actuellement ici",
    "employment.is_current_education": "J'étudie actuellement ici",
    "employment.is_current_generic": "C'est mon statut actuel",
    "employment.save_button": "Enregistrer l'Entrée",
    "employment.description_job": "Décrivez vos responsabilités et réalisations",
    "employment.description_education": "Décrivez votre éducation pendant cette période",
    "employment.description_unemployed": "Expliquez vos activités pendant cette période",
    "employment.description_other": "Décrivez cette période",
    "employment.contact_name_placeholder": "Nom et titre de référence",
    "employment.contact_info_placeholder": "Email ou numéro de téléphone",
    
    // Validation
    "validation.required": "Ce champ est obligatoire",
    "validation.min_years": "Veuillez fournir au moins {{required}} ans d'historique. Actuellement: {{current}} ans.",
    "validation.date_order": "La date de fin doit être postérieure à la date de début",
    "validation.date_overlap": "Les dates ne peuvent pas se chevaucher avec d'autres entrées",
    
    // Timeline
    "timeline.progress": "{{current}} / {{required}} ans",
    "timeline.progress_label": "Années comptabilisées",
    "timeline.gap": "Écart dans l'historique",
    "timeline.gap_description": "Écart dans l'historique ({{percentage}}% de la chronologie)",
    "common.present": "Présent"
  },
  
  it: {
    // Common
    "common.next": "Avanti",
    "common.previous": "Indietro",
    "common.save": "Salva",
    "common.cancel": "Annulla",
    "common.add": "Aggiungi",
    "common.edit": "Modifica",
    "common.remove": "Rimuovi",
    "common.years": "anni",
    
    // Form steps
    "step.personal_info": "Informazioni Personali",
    "step.residence_history": "Storico Residenze",
    "step.employment_history": "Storico Impieghi",
    "step.education": "Istruzione",
    "step.professional_licenses": "Licenze Professionali",
    "step.consents": "Consensi",
    "step.signature": "Revisione e Firma",
    
    // Residence History
    "residence.title": "Storico Residenze",
    "residence.intro": "Si prega di fornire lo storico completo delle residenze degli ultimi {{years}} anni, iniziando dall'indirizzo attuale o più recente.",
    "residence.progress": "{{current}} / {{required}} anni",
    "residence.entries_title": "Le Tue Residenze",
    "residence.add_title": "Aggiungi Residenza",
    "residence.add_button": "Aggiungi Residenza",
    "residence.address": "Indirizzo",
    "residence.city": "Città",
    "residence.state_province": "Stato/Provincia",
    "residence.zip_postal": "Codice Postale",
    "residence.country": "Paese",
    "residence.start_date": "Data di Inizio",
    "residence.end_date": "Data di Fine",
    "residence.is_current": "Attualmente vivo a questo indirizzo",
    "residence.save_button": "Salva Residenza",
    
    // Employment History
    "employment.title": "Storico Impieghi",
    "employment.intro": "Si prega di fornire lo storico completo degli impieghi degli ultimi {{years}} anni, iniziando dalla posizione attuale o più recente.",
    "employment.progress": "{{current}} / {{required}} anni",
    "employment.progress_label": "Progreso hacia {{required}} años de historial de empleo",
    "employment.select_type": "Tipo di Voce",
    "employment.entries_title": "Il Tuo Storico Impieghi",
    "employment.add_title": "Aggiungi Impiego",
    "employment.add_button": "Aggiungi Voce di Impiego",
    "employment.type": "Tipo di Voce",
    "employment.type_job": "Lavoro",
    "employment.type_education": "Istruzione",
    "employment.type_unemployed": "Disoccupato",
    "employment.type_other": "Altro",
    "employment.company": "Azienda/Organizzazione",
    "employment.position": "Posizione/Titolo",
    "employment.city": "Città",
    "employment.state_province": "Stato/Provincia",
    "employment.description": "Descrizione",
    "employment.contact_name": "Nome del Contatto",
    "employment.contact_info": "Informazioni di Contatto",
    "employment.start_date": "Data di Inizio",
    "employment.end_date": "Data di Fine",
    "employment.is_current_job": "Attualmente lavoro qui",
    "employment.is_current_education": "Attualmente studio qui",
    "employment.is_current_generic": "Questo è il mio stato attuale",
    "employment.save_button": "Salva Voce",
    "employment.description_job": "Descrivi le tue responsabilità e risultati",
    "employment.description_education": "Descrivi la tua istruzione durante questo periodo",
    "employment.description_unemployed": "Spiega le tue attività durante questo periodo",
    "employment.description_other": "Descrivi questo periodo",
    "employment.contact_name_placeholder": "Nome e titolo di riferimento",
    "employment.contact_info_placeholder": "Email o numero di telefono",
    
    // Validation
    "validation.required": "Questo campo è obbligatorio",
    "validation.min_years": "Si prega di fornire almeno {{required}} anni di storico. Attualmente: {{current}} anni.",
    "validation.date_order": "La data di fine deve essere successiva alla data di inizio",
    "validation.date_overlap": "Le date non possono sovrapporsi con altre voci",
    
    // Timeline
    "timeline.progress": "{{current}} / {{required}} anni",
    "timeline.progress_label": "Anni contabilizzati",
    "timeline.gap": "Lacuna nella cronologia",
    "timeline.gap_description": "Lacuna nella cronologia ({{percentage}}% della timeline)",
    "common.present": "Presente"
  }
} as const;

// Create a type for translation keys
export type TranslationKey = keyof typeof translations.en;

// Helper function for date formatting
export function formatDate(date: string, language: string): string {
  const dateObj = new Date(date);
  
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return dateObj.toLocaleDateString(getLocale(language), options);
}

// Helper function for number formatting
export function formatNumber(num: number, language: string): string {
  return num.toLocaleString(getLocale(language));
}

// Helper function to get locale from language code
function getLocale(language: string): string {
  switch (language) {
    case 'en': return 'en-US';
    case 'es': return 'es-ES';
    case 'fr': return 'fr-FR';
    case 'it': return 'it-IT';
    default: return 'en-US';
  }
}