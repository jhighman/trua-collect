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
    
    // Personal Information
    "personal_info.title": "Personal Information",
    "personal_info.description": "Please provide your personal information below.",
    "personal_info.full_name": "Full Name",
    "personal_info.email": "Email Address",
    "personal_info.valid": "All information is valid",
    "personal_info.invalid": "Please complete all required fields",
    
    // Consents
    "consents.title": "Required Consents",
    "consents.description": "Please review and provide the following required consents to proceed.",
    "consents.driver_license.title": "Driver License Verification Consent",
    "consents.driver_license.text": "I consent to the verification of my driver license information as part of this background check process. I understand that this may include confirming the validity, status, and history of my driver license with relevant authorities.",
    "consents.driver_license.checkbox": "I consent to driver license verification",
    "consents.drug_test.title": "Drug Test Consent",
    "consents.drug_test.text": "I consent to undergo drug testing as part of this employment screening process. I understand that test results will be shared with the requesting organization and may affect my eligibility for employment.",
    "consents.drug_test.checkbox": "I consent to drug testing",
    "consents.biometric.title": "Biometric Data Consent",
    "consents.biometric.text": "I consent to the collection, storage, and use of my biometric data (including but not limited to fingerprints, facial recognition, or other unique physical characteristics) for identity verification purposes.",
    "consents.biometric.checkbox": "I consent to biometric data collection and use",
    "consents.none_required": "No consents are required for this verification process.",
    "consents.valid": "All required consents have been provided",
    "consents.invalid": "Please provide all required consents to proceed",
    
    // Education
    "education.title": "Education History",
    "education.intro": "Please provide your education history, beginning with your most recent education.",
    "education.entries_title": "Your Education",
    "education.add_title": "Add Education",
    "education.edit_title": "Edit Education",
    "education.add_button": "Add Education",
    "education.institution": "Institution Name",
    "education.degree": "Degree",
    "education.field_of_study": "Field of Study",
    "education.location": "Location",
    "education.start_date": "Start Date",
    "education.end_date": "End Date",
    "education.is_current": "I am currently studying here",
    "education.description": "Description",
    "education.description_placeholder": "Describe your education, achievements, and activities",
    "education.save_button": "Save Education",
    "education.valid": "Education information is complete",
    "education.invalid": "Please complete all required education information",
    
    // Professional Licenses
    "licenses.title": "Professional Licenses",
    "licenses.intro": "Please provide information about your professional licenses and certifications.",
    "licenses.entries_title": "Your Professional Licenses",
    "licenses.add_title": "Add Professional License",
    "licenses.edit_title": "Edit Professional License",
    "licenses.add_button": "Add Professional License",
    "licenses.license_type": "License Type",
    "licenses.license_number": "License Number",
    "licenses.issuing_authority": "Issuing Authority",
    "licenses.state": "State/Province",
    "licenses.country": "Country",
    "licenses.issue_date": "Issue Date",
    "licenses.expiration_date": "Expiration Date",
    "licenses.is_active": "This license is currently active",
    "licenses.active": "Active",
    "licenses.description": "Description",
    "licenses.description_placeholder": "Additional information about this license",
    "licenses.save_button": "Save License",
    "licenses.valid": "Professional license information is complete",
    "licenses.invalid": "Please complete all required professional license information",
    
    // Signature
    "signature.title": "Your Signature",
    "signature.instructions": "Please sign using your mouse or touch screen below.",
    "signature.canvas_label": "Signature Canvas",
    "signature.clear": "Clear",
    "signature.clear_button_label": "Clear signature",
    "signature.error_empty": "Please provide your signature",
    "signature.attestation": "By signing above, I certify that all information provided is true and accurate to the best of my knowledge.",
    "signature.confirm": "I confirm that this is my legal signature",
    
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
    
    // Personal Information
    "personal_info.title": "Información Personal",
    "personal_info.description": "Por favor proporcione su información personal a continuación.",
    "personal_info.full_name": "Nombre Completo",
    "personal_info.email": "Correo Electrónico",
    "personal_info.valid": "Toda la información es válida",
    "personal_info.invalid": "Por favor complete todos los campos requeridos",
    
    // Consents
    "consents.title": "Consentimientos Requeridos",
    "consents.description": "Por favor revise y proporcione los siguientes consentimientos requeridos para continuar.",
    "consents.driver_license.title": "Consentimiento para Verificación de Licencia de Conducir",
    "consents.driver_license.text": "Doy mi consentimiento para la verificación de la información de mi licencia de conducir como parte de este proceso de verificación de antecedentes. Entiendo que esto puede incluir la confirmación de la validez, el estado y el historial de mi licencia de conducir con las autoridades pertinentes.",
    "consents.driver_license.checkbox": "Doy mi consentimiento para la verificación de la licencia de conducir",
    "consents.drug_test.title": "Consentimiento para Prueba de Drogas",
    "consents.drug_test.text": "Doy mi consentimiento para someterme a pruebas de drogas como parte de este proceso de selección de empleo. Entiendo que los resultados de las pruebas se compartirán con la organización solicitante y pueden afectar mi elegibilidad para el empleo.",
    "consents.drug_test.checkbox": "Doy mi consentimiento para las pruebas de drogas",
    "consents.biometric.title": "Consentimiento para Datos Biométricos",
    "consents.biometric.text": "Doy mi consentimiento para la recopilación, almacenamiento y uso de mis datos biométricos (incluidas, entre otras, huellas dactilares, reconocimiento facial u otras características físicas únicas) con fines de verificación de identidad.",
    "consents.biometric.checkbox": "Doy mi consentimiento para la recopilación y uso de datos biométricos",
    "consents.none_required": "No se requieren consentimientos para este proceso de verificación.",
    "consents.valid": "Se han proporcionado todos los consentimientos requeridos",
    "consents.invalid": "Por favor proporcione todos los consentimientos requeridos para continuar",
    
    // Education
    "education.title": "Historial Educativo",
    "education.intro": "Por favor proporcione su historial educativo, comenzando con su educación más reciente.",
    "education.entries_title": "Su Educación",
    "education.add_title": "Añadir Educación",
    "education.edit_title": "Editar Educación",
    "education.add_button": "Añadir Educación",
    "education.institution": "Nombre de la Institución",
    "education.degree": "Título",
    "education.field_of_study": "Campo de Estudio",
    "education.location": "Ubicación",
    "education.start_date": "Fecha de Inicio",
    "education.end_date": "Fecha de Finalización",
    "education.is_current": "Actualmente estudio aquí",
    "education.description": "Descripción",
    "education.description_placeholder": "Describa su educación, logros y actividades",
    "education.save_button": "Guardar Educación",
    "education.valid": "La información educativa está completa",
    "education.invalid": "Por favor complete toda la información educativa requerida",
    
    // Signature
    "signature.title": "Su Firma",
    "signature.instructions": "Por favor firme usando su ratón o pantalla táctil a continuación.",
    "signature.canvas_label": "Lienzo de Firma",
    "signature.clear": "Borrar",
    "signature.clear_button_label": "Borrar firma",
    "signature.error_empty": "Por favor proporcione su firma",
    "signature.attestation": "Al firmar arriba, certifico que toda la información proporcionada es verdadera y precisa según mi conocimiento.",
    "signature.confirm": "Confirmo que esta es mi firma legal",
    
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
    
    // Personal Information
    "personal_info.title": "Informations Personnelles",
    "personal_info.description": "Veuillez fournir vos informations personnelles ci-dessous.",
    "personal_info.full_name": "Nom Complet",
    "personal_info.email": "Adresse Email",
    "personal_info.valid": "Toutes les informations sont valides",
    "personal_info.invalid": "Veuillez compléter tous les champs obligatoires",
    
    // Consents
    "consents.title": "Consentements Requis",
    "consents.description": "Veuillez examiner et fournir les consentements requis suivants pour continuer.",
    "consents.driver_license.title": "Consentement pour la Vérification du Permis de Conduire",
    "consents.driver_license.text": "Je consens à la vérification des informations de mon permis de conduire dans le cadre de ce processus de vérification des antécédents. Je comprends que cela peut inclure la confirmation de la validité, du statut et de l'historique de mon permis de conduire auprès des autorités compétentes.",
    "consents.driver_license.checkbox": "Je consens à la vérification du permis de conduire",
    "consents.drug_test.title": "Consentement pour Test de Dépistage de Drogues",
    "consents.drug_test.text": "Je consens à me soumettre à des tests de dépistage de drogues dans le cadre de ce processus de sélection d'emploi. Je comprends que les résultats des tests seront partagés avec l'organisation demandeuse et peuvent affecter mon éligibilité à l'emploi.",
    "consents.drug_test.checkbox": "Je consens aux tests de dépistage de drogues",
    "consents.biometric.title": "Consentement pour Données Biométriques",
    "consents.biometric.text": "Je consens à la collecte, au stockage et à l'utilisation de mes données biométriques (y compris, mais sans s'y limiter, les empreintes digitales, la reconnaissance faciale ou d'autres caractéristiques physiques uniques) à des fins de vérification d'identité.",
    "consents.biometric.checkbox": "Je consens à la collecte et à l'utilisation de données biométriques",
    "consents.none_required": "Aucun consentement n'est requis pour ce processus de vérification.",
    "consents.valid": "Tous les consentements requis ont été fournis",
    "consents.invalid": "Veuillez fournir tous les consentements requis pour continuer",
    
    // Education
    "education.title": "Historique d'Éducation",
    "education.intro": "Veuillez fournir votre historique d'éducation, en commençant par votre éducation la plus récente.",
    "education.entries_title": "Votre Éducation",
    "education.add_title": "Ajouter une Éducation",
    "education.edit_title": "Modifier une Éducation",
    "education.add_button": "Ajouter une Éducation",
    "education.institution": "Nom de l'Institution",
    "education.degree": "Diplôme",
    "education.field_of_study": "Domaine d'Étude",
    "education.location": "Emplacement",
    "education.start_date": "Date de Début",
    "education.end_date": "Date de Fin",
    "education.is_current": "J'étudie actuellement ici",
    "education.description": "Description",
    "education.description_placeholder": "Décrivez votre éducation, vos réalisations et vos activités",
    "education.save_button": "Enregistrer l'Éducation",
    "education.valid": "Les informations d'éducation sont complètes",
    "education.invalid": "Veuillez compléter toutes les informations d'éducation requises",
    
    // Signature
    "signature.title": "Votre Signature",
    "signature.instructions": "Veuillez signer en utilisant votre souris ou écran tactile ci-dessous.",
    "signature.canvas_label": "Zone de Signature",
    "signature.clear": "Effacer",
    "signature.clear_button_label": "Effacer la signature",
    "signature.error_empty": "Veuillez fournir votre signature",
    "signature.attestation": "En signant ci-dessus, je certifie que toutes les informations fournies sont véridiques et exactes à ma connaissance.",
    "signature.confirm": "Je confirme que ceci est ma signature légale",
    
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
    
    // Personal Information
    "personal_info.title": "Informazioni Personali",
    "personal_info.description": "Si prega di fornire le proprie informazioni personali qui sotto.",
    "personal_info.full_name": "Nome Completo",
    "personal_info.email": "Indirizzo Email",
    "personal_info.valid": "Tutte le informazioni sono valide",
    "personal_info.invalid": "Si prega di completare tutti i campi obbligatori",
    
    // Consents
    "consents.title": "Consensi Richiesti",
    "consents.description": "Si prega di esaminare e fornire i seguenti consensi richiesti per procedere.",
    "consents.driver_license.title": "Consenso per la Verifica della Patente di Guida",
    "consents.driver_license.text": "Acconsento alla verifica delle informazioni della mia patente di guida come parte di questo processo di controllo dei precedenti. Comprendo che ciò può includere la conferma della validità, dello stato e della storia della mia patente di guida presso le autorità competenti.",
    "consents.driver_license.checkbox": "Acconsento alla verifica della patente di guida",
    "consents.drug_test.title": "Consenso per Test Antidroga",
    "consents.drug_test.text": "Acconsento a sottopormi a test antidroga come parte di questo processo di selezione per l'impiego. Comprendo che i risultati dei test saranno condivisi con l'organizzazione richiedente e potrebbero influire sulla mia idoneità all'impiego.",
    "consents.drug_test.checkbox": "Acconsento ai test antidroga",
    "consents.biometric.title": "Consenso per Dati Biometrici",
    "consents.biometric.text": "Acconsento alla raccolta, all'archiviazione e all'uso dei miei dati biometrici (inclusi, ma non limitati a, impronte digitali, riconoscimento facciale o altre caratteristiche fisiche uniche) per scopi di verifica dell'identità.",
    "consents.biometric.checkbox": "Acconsento alla raccolta e all'uso dei dati biometrici",
    "consents.none_required": "Nessun consenso è richiesto per questo processo di verifica.",
    "consents.valid": "Tutti i consensi richiesti sono stati forniti",
    "consents.invalid": "Si prega di fornire tutti i consensi richiesti per procedere",
    
    // Education
    "education.title": "Storico Istruzione",
    "education.intro": "Si prega di fornire il proprio storico di istruzione, iniziando dall'istruzione più recente.",
    "education.entries_title": "La Tua Istruzione",
    "education.add_title": "Aggiungi Istruzione",
    "education.edit_title": "Modifica Istruzione",
    "education.add_button": "Aggiungi Istruzione",
    "education.institution": "Nome dell'Istituzione",
    "education.degree": "Titolo di Studio",
    "education.field_of_study": "Campo di Studio",
    "education.location": "Località",
    "education.start_date": "Data di Inizio",
    "education.end_date": "Data di Fine",
    "education.is_current": "Attualmente studio qui",
    "education.description": "Descrizione",
    "education.description_placeholder": "Descrivi la tua istruzione, i tuoi risultati e le tue attività",
    "education.save_button": "Salva Istruzione",
    "education.valid": "Le informazioni sull'istruzione sono complete",
    "education.invalid": "Si prega di completare tutte le informazioni sull'istruzione richieste",
    
    // Signature
    "signature.title": "La Tua Firma",
    "signature.instructions": "Si prega di firmare utilizzando il mouse o lo schermo touch qui sotto.",
    "signature.canvas_label": "Area di Firma",
    "signature.clear": "Cancella",
    "signature.clear_button_label": "Cancella firma",
    "signature.error_empty": "Si prega di fornire la propria firma",
    "signature.attestation": "Firmando sopra, certifico che tutte le informazioni fornite sono vere e accurate al meglio delle mie conoscenze.",
    "signature.confirm": "Confermo che questa è la mia firma legale",
    
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