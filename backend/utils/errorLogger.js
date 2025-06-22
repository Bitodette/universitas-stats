const errorLogger = (error) => {
  console.error('ERROR DETAILS:');
  console.error('Name:', error.name);
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  
  if (error.errors) {
    console.error('Validation Errors:', error.errors);
  }
};

module.exports = errorLogger;
