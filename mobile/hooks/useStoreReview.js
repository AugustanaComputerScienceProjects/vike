import * as StoreReview from 'expo-store-review';

const useStoreReview = () => {
  const requestReview = async () => {
    if (StoreReview?.requestReview) {
      await StoreReview.requestReview();
      return;
    }
  };

  return {requestReview};
};

export default useStoreReview;
