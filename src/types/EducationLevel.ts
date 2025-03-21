// Define education levels
export enum EducationLevel {
  LessThanHighSchool = 'less_than_high_school',
  HighSchool = 'high_school',
  SomeCollege = 'some_college',
  Associates = 'associates',
  Bachelors = 'bachelors',
  Masters = 'masters',
  Doctorate = 'doctorate',
  Professional = 'professional'
}

// Helper function to determine if an education level is college or higher
export const isCollegeOrHigher = (level: EducationLevel | string): boolean => {
  if (!level) return false;
  
  return [
    EducationLevel.Associates,
    EducationLevel.Bachelors,
    EducationLevel.Masters,
    EducationLevel.Doctorate,
    EducationLevel.Professional
  ].includes(level as EducationLevel);
};