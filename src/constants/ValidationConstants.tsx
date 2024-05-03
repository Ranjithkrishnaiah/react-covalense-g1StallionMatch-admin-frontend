const MIN_LENGTH_PASSWORD = 6;
const MAX_LENGTH_PASSWORD = 50;
const MIN_LENGTH_NAME = 2;
const MAX_LENGTH_NAME = 50;
const MIN_LENGTH_FARM_NAME = 5;
const MAX_LENGTH_FARM_NAME = 50;
const MAX_LENGTH_EMAIL = 50;
const emailValidation = 'Email is a required field';
const fullNameValidation = 'Fullname is a required field';
const farmNameValidation = 'Farm name is a required field';
const farmWebsiteValidation = 'Farm Website is a required field.';
const countryValidation = 'Country is a required field';
const stateValidation = 'State is a required field';
const passwordValidation = 'Password is a required field';
const confirmPasswordValidation = 'Confirm password is a required field';
const confirmPasswordMismatch = 'Confirm Password must match Password';
const acceptTerms = 'Please accept the terms and conditions';
const mareRequired = 'Mare is a required field';
const stallionLocationRequired = 'Location of stallions is a required field';
const stallionRequired = 'Stallion is a required field';
const saleLocationRequired = 'Sale location is a required field';
const saleRequired = 'Sale is a required field';
const currencyRequired = 'Please choose the currency';
const stallionName = 'Stallion name is a required field';
const year = 'year is a required field';
const emailFormatValidation = 'Please enter valid email address';
const fee = "Fee is a required field";
const name = "Name is a required field"

export const ValidationConstants = {
  minPasswordLength: MIN_LENGTH_PASSWORD,
  maxPasswordLength: MAX_LENGTH_PASSWORD,
  minNameLength: MIN_LENGTH_NAME,
  maxNameLength: MAX_LENGTH_NAME,
  minFarmNameLength: MIN_LENGTH_FARM_NAME,
  maxFarmNameLength: MAX_LENGTH_FARM_NAME,
  maxEmailLength: MAX_LENGTH_EMAIL,
  fullNameValidation,
  farmNameValidation,
  farmWebsiteValidation,
  emailValidation,
  countryValidation,
  stateValidation,
  passwordValidation,
  confirmPasswordValidation,
  confirmPasswordMismatch,
  acceptTerms,
  mareRequired,
  stallionRequired,
  stallionLocationRequired,
  saleLocationRequired,
  saleRequired,
  currencyRequired,
  stallionName,
  year,
  emailFormatValidation,
  fee,
  name
};
