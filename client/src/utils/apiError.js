export const extractApiError = (error) => {
  const data = error.response?.data;

  if (data?.errors?.length) {
    return {
      message: data.message || 'Validation failed',
      errors: data.errors,
    };
  }

  return {
    message: data?.message || error.message || 'Something went wrong',
    errors: null,
  };
};
