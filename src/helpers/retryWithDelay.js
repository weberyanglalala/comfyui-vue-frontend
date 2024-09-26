export const retryWithDelay = async (fn, options = {}) => {
    const { maxRetries = 5, delay = 5000, onRetry = () => {} } = options;

    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            return await fn();
        } catch (error) {
            retryCount++;

            if (retryCount >= maxRetries) {
                throw error;
            }

            await onRetry(retryCount);

            // Wait for the specified delay before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw new Error('Maximum retries reached');
};
