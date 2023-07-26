export const responseHandler = (statusCode: number, message: string) => {
  return {
    statusCode,
    message,
  };
};
