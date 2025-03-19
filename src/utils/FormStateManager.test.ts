import { FormStateManager } from './FormStateManager';
import { FormConfig, FormStepId } from './FormConfigGenerator';

describe('FormStateManager', () => {
  let config: FormConfig;
  let manager: FormStateManager;

  beforeEach(() => {
    config = {
      steps: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          enabled: true,
          required: true,
          order: 1,
          fields: [
            {
              id: 'fullName',
              type: 'text',
              label: 'Full Name',
              required: true,
              validation: [
                { type: 'required', message: 'Full name is required' }
              ]
            },
            {
              id: 'email',
              type: 'email',
              label: 'Email',
              required: true,
              validation: [
                { type: 'required', message: 'Email is required' },
                { 
                  type: 'pattern',
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format'
                }
              ]
            }
          ]
        },
        {
          id: 'residence-history',
          title: 'Residence History',
          enabled: true,
          required: true,
          order: 2,
          fields: [],
          validationRules: {
            requiredYears: 7,
            requiredVerifications: ['address', 'duration']
          }
        }
      ],
      initialStep: 'personal-info' as FormStepId,
      navigation: {
        allowSkip: false,
        allowPrevious: true,
        requiredSteps: ['personal-info', 'residence-history']
      }
    };

    manager = new FormStateManager(config);
  });

  describe('initialization', () => {
    it('should initialize with correct initial state', () => {
      const state = manager.getState();
      expect(state.currentStep).toBe('personal-info');
      expect(state.isComplete).toBe(false);
      expect(state.isSubmitting).toBe(false);
    });

    it('should initialize all steps with empty values', () => {
      const state = manager.getState();
      config.steps.forEach(step => {
        expect(state.steps[step.id]).toBeDefined();
        expect(state.steps[step.id]!.values).toEqual({});
        expect(state.steps[step.id]!.isComplete).toBe(false);
      });
    });
  });

  describe('form validation', () => {
    it('should validate required fields', () => {
      const state = manager.setValue('personal-info', 'fullName', '');
      expect(state.steps['personal-info']!.errors.fullName).toBe('Full name is required');
    });

    it('should validate email format', () => {
      let state = manager.setValue('personal-info', 'email', 'invalid-email');
      expect(state.steps['personal-info']!.errors.email).toBe('Invalid email format');

      state = manager.setValue('personal-info', 'email', 'valid@email.com');
      expect(state.steps['personal-info']!.errors.email).toBeUndefined();
    });
  });

  describe('timeline validation', () => {
    it('should calculate timeline coverage correctly', () => {
      const entries = [
        {
          startDate: '2020-01-01',
          endDate: '2022-01-01',
          isCurrent: false
        },
        {
          startDate: '2022-01-01',
          endDate: null,
          isCurrent: true
        }
      ];

      const state = manager.setValue('residence-history', 'entries', entries);
      const currentYear = new Date().getFullYear();
      const coverage = currentYear - 2020;
      
      // Coverage should be at least 3 years (2020-2022 plus current year)
      expect(state.steps['residence-history']!.isValid).toBe(coverage >= 7);
    });
  });

  describe('navigation', () => {
    it('should prevent navigation to next step if current step is invalid', () => {
      const navigation = manager.getNavigationState();
      expect(navigation.canMoveNext).toBe(false);
    });

    it('should allow navigation to next step when current step is complete', () => {
      manager.setValue('personal-info', 'fullName', 'John Doe');
      manager.setValue('personal-info', 'email', 'john@example.com');
      
      const navigation = manager.getNavigationState();
      expect(navigation.canMoveNext).toBe(true);
    });

    it('should track completed steps', () => {
      manager.setValue('personal-info', 'fullName', 'John Doe');
      manager.setValue('personal-info', 'email', 'john@example.com');
      
      const navigation = manager.getNavigationState();
      expect(navigation.completedSteps).toContain('personal-info');
    });
  });
}); 