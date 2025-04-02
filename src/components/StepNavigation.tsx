import React from 'react';
import { Button } from './ui/button';
import { useTranslation } from '../context/TranslationContext';
import './StepNavigation.css';

interface StepNavigationProps {
  onNext: () => void;
  onPrevious?: () => void;
  canMoveNext: boolean;
  canMovePrevious?: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  onNext,
  onPrevious,
  canMoveNext,
  canMovePrevious = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className="form-navigation">
      <div className="flex items-center justify-between w-full">
        <div className="navigation-button-container">
          {/* Only show the Previous button if canMovePrevious is true and onPrevious is provided */}
          {canMovePrevious && onPrevious ? (
            <Button
              type="button"
              onClick={onPrevious}
              variant="outline"
              className="navigation-button previous-button"
              aria-label="Previous step"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              {t('common.previous') || 'Previous'}
            </Button>
          ) : (
            /* Add an empty div to maintain layout when there's no Previous button */
            <div></div>
          )}
        </div>
        <div className="navigation-button-container">
          <Button
            type="button"
            onClick={() => {
              console.log('Next button clicked, canMoveNext:', canMoveNext);
              onNext();
            }}
            disabled={!canMoveNext}
            className="navigation-button next-button"
            aria-label="Next step"
          >
            {t('common.next') || 'Next'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StepNavigation;