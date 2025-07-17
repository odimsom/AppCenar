const handlerPromise = (promise = Promise.resolve()) => {
  try {
    return promise.then((data) => [null, data]).catch((error) => [error, null]);
  } catch (error) {
    return [error, null];
  }
};

export default handlerPromise;
