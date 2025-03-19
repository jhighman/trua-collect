# React Components for SignR Form Application

## Core Components

### App.js
Main application component that sets up routing and context providers.

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FormProvider from './context/FormProvider';
import FormContainer from './components/FormContainer';
import Confirmation from './components/Confirmation';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <FormProvider>
        <Routes>
          <Route path="/" element={<FormContainer />} />
          <Route path="/confirmation" element={<Confirmation />} />
        </Routes>
      </FormProvider>
    </BrowserRouter>
  );
}

export default App;
```

### FormProvider.js
Context provider for form state management.

```jsx
import React, { createContext, useReducer, useContext } from 'react';

const FormContext = createContext();

const initialState = {
  currentStep: 1,
  totalSteps: 4,
  residenceHistoryRequired: false,
  yearsRequired: 7,
  degreeRequired: false,
  personalInfo: {
    fullName: '',
    email: '',
    phone: ''
  },
  residences: [],
  employmentEntries: [],
  signature: null,
  legalAcknowledgment: false,
  formErrors: {}
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_PERSONAL_INFO':
      return { ...state, personalInfo: { ...state.personalInfo, ...action.payload } };
    case 'ADD_RESIDENCE':
      return { ...state, residences: [...state.residences, action.payload] };
    case 'UPDATE_RESIDENCE':
      return {
        ...state,
        residences: state.residences.map((res, index) => 
          index === action.payload.index ? action.payload.data : res
        )
      };
    case 'DELETE_RESIDENCE':
      return {
        ...state,
        residences: state.residences.filter((_, index) => index !== action.payload)
      };
    case 'ADD_EMPLOYMENT':
      return { ...state, employmentEntries: [...state.employmentEntries, action.payload] };
    case 'UPDATE_EMPLOYMENT':
      return {
        ...state,
        employmentEntries: state.employmentEntries.map((entry, index) => 
          index === action.payload.index ? action.payload.data : entry
        )
      };
    case 'DELETE_EMPLOYMENT':
      return {
        ...state,
        employmentEntries: state.employmentEntries.filter((_, index) => index !== action.payload)
      };
    case 'SET_SIGNATURE':
      return { ...state, signature: action.payload };
    case 'SET_LEGAL_ACKNOWLEDGMENT':
      return { ...state, legalAcknowledgment: action.payload };
    case 'SET_FORM_ERRORS':
      return { ...state, formErrors: action.payload };
    case 'INITIALIZE_FORM':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function FormProvider({ children }) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  return (
    <FormContext.Provider value={{ state, dispatch }}>
      {children}
    </FormContext.Provider>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
}

export default FormProvider;
```

### FormContainer.js
Main container for the form that handles step navigation.

```jsx
import React, { useEffect } from 'react';
import { useForm } from '../context/FormProvider';
import StepIndicator from './StepIndicator';
import PersonalInfo from './steps/PersonalInfo';
import ResidenceHistory from './steps/ResidenceHistory';
import ResidenceEntry from './steps/ResidenceEntry';
import EmploymentHistory from './steps/EmploymentHistory';
import EmploymentEntry from './steps/EmploymentEntry';
import Signature from './steps/Signature';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '../context/TranslationProvider';

function FormContainer() {
  const { state, dispatch } = useForm();
  const { t } = useTranslation();
  
  useEffect(() => {
    // Initialize form with URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const yearsRequired = parseInt(urlParams.get('years')) || 7;
    const degreeRequired = urlParams.get('degree_required') === 'true';
    const residenceHistoryRequired = urlParams.get('residence_history_required') === 'true';
    
    dispatch({ 
      type: 'INITIALIZE_FORM', 
      payload: { 
        yearsRequired, 
        degreeRequired, 
        residenceHistoryRequired,
        totalSteps: residenceHistoryRequired ? 4 : 3
      } 
    });
  }, [dispatch]);
  
  // Render the current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <PersonalInfo />;
      case 2:
        if (state.residenceHistoryRequired) {
          return <ResidenceHistory />;
        } else {
          return <EmploymentHistory />;
        }
      case 3:
        if (state.residenceHistoryRequired) {
          return <ResidenceEntry />;
        } else {
          return <EmploymentEntry />;
        }
      case 4:
        if (state.residenceHistoryRequired) {
          return <EmploymentHistory />;
        } else {
          return <Signature />;
        }
      case 5:
        if (state.residenceHistoryRequired) {
          return <EmploymentEntry />;
        }
        return null;
      case 6:
        if (state.residenceHistoryRequired) {
          return <Signature />;
        }
        return null;
      default:
        return <PersonalInfo />;
    }
  };
  
  return (
    <div className="container">
      <header>
        <div className="logo-container">
          <div className="logo" aria-hidden="true">
            {/* SVG Logo */}
          </div>
          <div className="tagline">Truth, Trust & Ownership</div>
        </div>
        <LanguageSwitcher />
        <StepIndicator />
      </header>
      
      <main>
        <form id="employmentForm" onSubmit={(e) => e.preventDefault()}>
          {renderStep()}
        </form>
      </main>
    </div>
  );
}

export default FormContainer;
```

## Form Steps

### PersonalInfo.js
First step for collecting personal information.

### ResidenceHistory.js
Overview of residence history with list of added residences.

### ResidenceEntry.js
Form for adding or editing a residence entry.

### EmploymentHistory.js
Timeline visualization and list of employment entries.

### EmploymentEntry.js
Form for adding or editing an employment entry.

### Signature.js
Final step with signature pad and legal acknowledgment.

## Shared Components

### StepIndicator.js
Shows the current step progress.

### FormNavigation.js
Next/Previous buttons for form navigation.

### Timeline.js
Visual timeline component for employment history.

### LanguageSwitcher.js
Dropdown for changing the application language.

### ConfirmDialog.js
Reusable confirmation dialog for deletions.

## Utilities

### api.js
API service functions for translations and form submission.

```javascript
// api.js
const API_BASE_URL = '/api';

export const fetchTranslations = async (lang = 'en') => {
  try {
    const response = await fetch(`${API_BASE_URL}/translations/${lang}`);
    if (!response.ok) throw new Error(`Translation fetch failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error loading translations:', error);
    return null;
  }
};

export const submitForm = async (formData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error(`Form submission failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
};
```

### validation.js
Form validation functions.

```javascript
// validation.js
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^\+?[0-9]{10,15}$/;
  return re.test(phone.replace(/\s+/g, ''));
};

export const validateDate = (date) => {
  return date && date.match(/^\d{4}-\d{2}$/);
};

export const validatePersonalInfo = (personalInfo) => {
  const errors = {};
  
  if (!personalInfo.fullName) {
    errors.fullName = 'Full name is required';
  }
  
  if (!personalInfo.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(personalInfo.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (personalInfo.phone && !validatePhone(personalInfo.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return errors;
};

export const validateResidence = (residence) => {
  const errors = {};
  
  if (!residence.address) errors.address = 'Address is required';
  if (!residence.city) errors.city = 'City is required';
  if (!residence.stateProvince) errors.stateProvince = 'State/Province is required';
  if (!residence.zipPostal) errors.zipPostal = 'ZIP/Postal code is required';
  if (!residence.country) errors.country = 'Country is required';
  if (!residence.startDate) errors.startDate = 'Start date is required';
  if (!residence.isCurrent && !residence.endDate) errors.endDate = 'End date is required';
  
  if (residence.startDate && residence.endDate && !residence.isCurrent) {
    const start = new Date(residence.startDate);
    const end = new Date(residence.endDate);
    if (start > end) {
      errors.endDate = 'End date must be after start date';
    }
  }
  
  return errors;
};

export const validateEmployment = (entry) => {
  const errors = {};
  
  if (!entry.type) errors.type = 'Type is required';
  if (entry.type !== 'Gap' && !entry.company) errors.company = 'Company/Institution is required';
  if (!entry.startDate) errors.startDate = 'Start date is required';
  if (!entry.isCurrent && !entry.endDate) errors.endDate = 'End date is required';
  
  if (entry.startDate && entry.endDate && !entry.isCurrent) {
    const start = new Date(entry.startDate);
    const end = new Date(entry.endDate);
    if (start > end) {
      errors.endDate = 'End date must be after start date';
    }
  }
  
  return errors;
};

export const validateForm = (formState) => {
  const errors = {};
  
  // Validate personal info
  const personalInfoErrors = validatePersonalInfo(formState.personalInfo);
  if (Object.keys(personalInfoErrors).length > 0) {
    errors.personalInfo = personalInfoErrors;
  }
  
  // Validate residences if required
  if (formState.residenceHistoryRequired && formState.residences.length === 0) {
    errors.residences = 'Please add at least one residence';
  }
  
  // Validate employment entries
  if (formState.employmentEntries.length === 0) {
    errors.employmentEntries = 'Please add at least one employment entry';
  }
  
  // Validate signature
  if (!formState.signature) {
    errors.signature = 'Signature is required';
  }
  
  // Validate legal acknowledgment
  if (!formState.legalAcknowledgment) {
    errors.legalAcknowledgment = 'Please acknowledge the statement';
  }
  
  return errors;
};
```

### dateUtils.js
Date formatting and calculations.

```javascript
// dateUtils.js
export const formatMonthYear = (dateStr) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

export const calculateYearsAccounted = (entries) => {
  if (!entries || entries.length === 0) return 0;
  
  // Sort entries by start date
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(a.startDate) - new Date(b.startDate);
  });
  
  let totalYears = 0;
  let latestEnd = null;
  
  sortedEntries.forEach(entry => {
    const start = new Date(entry.startDate);
    const end = entry.isCurrent ? new Date() : new Date(entry.endDate);
    
    if (!latestEnd || start > latestEnd) {
      // No overlap, add full duration
      const duration = (end - start) / (1000 * 60 * 60 * 24 * 365.25);
      totalYears += duration;
    } else if (end > latestEnd) {
      // Partial overlap, add only the non-overlapping part
      const duration = (end - latestEnd) / (1000 * 60 * 60 * 24 * 365.25);
      totalYears += duration;
    }
    
    // Update latest end date if this entry ends later
    if (!latestEnd || end > latestEnd) {
      latestEnd = end;
    }
  });
  
  return totalYears;
};