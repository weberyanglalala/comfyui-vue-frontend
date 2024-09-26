export const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target.result; // Set image src to file's base64 data
        };

        img.onload = () => {
            const width = img.width;
            const height = img.height;
            resolve({ width, height }); // Resolve the dimensions
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        reader.readAsDataURL(file); // Read the file as a Data URL
    });
};
