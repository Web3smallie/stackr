export const STACKR_DATA_CHANGED_EVENT = "stackr:data-changed";

export const emitStackrDataChanged = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(STACKR_DATA_CHANGED_EVENT));
};

export const subscribeToStackrDataChanged = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(STACKR_DATA_CHANGED_EVENT, callback);

  return () => {
    window.removeEventListener(STACKR_DATA_CHANGED_EVENT, callback);
  };
};
