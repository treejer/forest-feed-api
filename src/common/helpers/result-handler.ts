export const resultHandler = (statusCode: number, message: string, data) => {
  return {
    statusCode,
    message,
    data,
  };
};
