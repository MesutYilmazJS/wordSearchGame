const MONETIZATION_STORAGE_KEY = "kelime-avi-monetization";
const DEFAULT_STATE = {
  ownedProducts: [],
  levelsSinceInterstitial: 0,
  nextInterstitialGap: 2
};

const randomInterstitialGap = () => 2 + Math.floor(Math.random() * 2);

const getCapacitorPlugins = () => {
  if (typeof window === "undefined") return null;
  return window.Capacitor?.Plugins || null;
};

const readState = () => {
  try {
    const raw = localStorage.getItem(MONETIZATION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      ownedProducts: Array.isArray(parsed.ownedProducts) ? parsed.ownedProducts : [],
      levelsSinceInterstitial: Number.isInteger(parsed.levelsSinceInterstitial) ? parsed.levelsSinceInterstitial : 0,
      nextInterstitialGap: parsed.nextInterstitialGap === 3 ? 3 : 2
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
};

const writeState = (state) => {
  localStorage.setItem(MONETIZATION_STORAGE_KEY, JSON.stringify(state));
};

export class MobileBridge {
  constructor(options = {}) {
    this.options = options;
  }

  async initialize() {
    const plugins = getCapacitorPlugins();
    const admob = plugins?.AdMob;

    if (!admob?.initialize) return;

    try {
      await admob.initialize();
    } catch {
      // Fallback silently to local simulation until the real mobile plugin is wired.
    }
  }

  getOwnedProducts() {
    return readState().ownedProducts;
  }

  hasProduct(productId) {
    return this.getOwnedProducts().includes(productId);
  }

  async purchaseProduct(productId) {
    const plugins = getCapacitorPlugins();
    const billing = plugins?.InAppPurchases || plugins?.Purchases;
    const current = readState();

    if (billing?.purchaseProduct) {
      try {
        const result = await billing.purchaseProduct({ productId });
        if (result?.success) {
          const nextState = {
            ...current,
            ownedProducts: [...new Set([...current.ownedProducts, productId])]
          };
          writeState(nextState);
          return { success: true, source: "capacitor" };
        }
      } catch {
        // Fall through to local simulation.
      }
    }

    const nextState = {
      ...current,
      ownedProducts: [...new Set([...current.ownedProducts, productId])]
    };
    writeState(nextState);
    return { success: true, source: "simulation" };
  }

  async restorePurchases() {
    const plugins = getCapacitorPlugins();
    const billing = plugins?.InAppPurchases || plugins?.Purchases;

    if (!billing?.restorePurchases) {
      return this.getOwnedProducts();
    }

    try {
      const restored = await billing.restorePurchases();
      const productIds = Array.isArray(restored?.productIds) ? restored.productIds : this.getOwnedProducts();
      writeState({
        ...readState(),
        ownedProducts: [...new Set(productIds)]
      });
      return productIds;
    } catch {
      return this.getOwnedProducts();
    }
  }

  registerLevelCompletion() {
    const state = readState();
    const nextState = {
      ...state,
      levelsSinceInterstitial: state.levelsSinceInterstitial + 1
    };
    writeState(nextState);
    return nextState;
  }

  shouldShowInterstitial() {
    const state = readState();
    return state.levelsSinceInterstitial >= state.nextInterstitialGap;
  }

  consumeInterstitialOpportunity() {
    const state = readState();
    writeState({
      ...state,
      levelsSinceInterstitial: 0,
      nextInterstitialGap: randomInterstitialGap()
    });
  }

  async showInterstitial(showFallback) {
    const plugins = getCapacitorPlugins();
    const admob = plugins?.AdMob;

    if (admob?.showInterstitial) {
      try {
        await admob.showInterstitial();
        this.consumeInterstitialOpportunity();
        return { shown: true, source: "capacitor" };
      } catch {
        // Fall through to fallback.
      }
    }

    if (typeof showFallback === "function") {
      await showFallback();
    }

    this.consumeInterstitialOpportunity();
    return { shown: true, source: "simulation" };
  }

  async showRewarded(showFallback) {
    const plugins = getCapacitorPlugins();
    const admob = plugins?.AdMob;

    if (admob?.showRewardVideoAd) {
      try {
        await admob.showRewardVideoAd();
        return { rewarded: true, source: "capacitor" };
      } catch {
        // Fall through to fallback.
      }
    }

    if (typeof showFallback === "function") {
      await showFallback();
    }

    return { rewarded: true, source: "simulation" };
  }
}

