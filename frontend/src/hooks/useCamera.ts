export const useCamera = () => {
  const requestAccess = async () => navigator.mediaDevices?.getUserMedia?.({ video: true });
  return { requestAccess };
};
