import { useMutation } from '@tanstack/react-query';
import { analyzeImage } from '../services/api';

export const useAnalyze = () => {
  return useMutation({
    mutationFn: analyzeImage,
  });
};
