/**
 * NSFW Detection Module for Primal Men
 *
 * Uses NSFWJS with TensorFlow.js for client-side image scanning.
 * All processing happens on-device - NO photos sent to third-party APIs.
 *
 * Thresholds are tuned for a gay dating app:
 * - Shirtless/topless photos are ALLOWED (normal for dating apps)
 * - Only actual explicit nudity/sexual content is blocked
 * - Hentai (cartoon porn) is blocked
 */

import { Capacitor } from '@capacitor/core';

// Dynamic imports — TensorFlow.js is only loaded on web, never on native
let tf: typeof import('@tensorflow/tfjs') | null = null;
let nsfwjs: typeof import('nsfwjs') | null = null;

// NSFWJS prediction categories
export type NSFWCategory = 'Drawing' | 'Hentai' | 'Neutral' | 'Porn' | 'Sexy';

export interface NSFWPrediction {
  className: NSFWCategory;
  probability: number;
}

export interface NSFWScanResult {
  passed: boolean;
  modelAvailable: boolean;
  scores: Record<NSFWCategory, number>;
  failedCategory: NSFWCategory | null;
  requiresManualReview: boolean;
  message: string | null;
}

// Thresholds tuned for gay dating app
// Shirtless/speedo photos should PASS - only block actual explicit content
const THRESHOLDS: Partial<Record<NSFWCategory, number>> = {
  Porn: 0.70,    // Block actual nudity/sexual content
  Hentai: 0.70,  // Block cartoon porn
  // Sexy: NOT blocked - shirtless/speedo is normal for dating apps
  // Drawing: NOT blocked
  // Neutral: Obviously not blocked
};

// User-friendly messages
const BLOCK_MESSAGES: Record<string, string> = {
  Porn: "This photo is too explicit for your public profile. Save it for your private album instead — you can share it with people you connect with.",
  Hentai: "This type of image isn't allowed as a public profile photo. Please upload a real photo of yourself.",
};

// Singleton model instance
let model: any | null = null;
let modelLoading: Promise<any> | null = null;
let modelLoadFailed = false;

/**
 * Check if we're running inside Capacitor native shell (iOS/Android).
 * TensorFlow.js + NSFWJS should NEVER load on native — it causes
 * WKWebView memory pressure and crashes, especially on iPad.
 * On native, photos go through server-side moderation instead.
 */
function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Dynamically import TensorFlow.js and NSFWJS (web only)
 */
async function loadDeps(): Promise<boolean> {
  if (tf && nsfwjs) return true;
  try {
    const [tfModule, nsfwModule] = await Promise.all([
      import('@tensorflow/tfjs'),
      import('nsfwjs'),
    ]);
    tf = tfModule;
    nsfwjs = nsfwModule;
    return true;
  } catch (error) {
    console.error('[NSFW] Failed to load TF.js dependencies:', error);
    return false;
  }
}

/**
 * Load the NSFWJS model (singleton pattern)
 * Model is loaded once and cached for the session.
 * Returns null on native platforms — photos use server-side moderation instead.
 */
export async function loadNSFWModel(): Promise<any | null> {
  // NEVER load TF.js on native — causes WKWebView crashes on iPad
  if (isNative()) {
    console.log('[NSFW] Skipping model load on native platform');
    return null;
  }

  // Return cached model if available
  if (model) {
    return model;
  }

  // If we already know loading failed, don't retry
  if (modelLoadFailed) {
    return null;
  }

  // If currently loading, wait for it
  if (modelLoading) {
    try {
      return await modelLoading;
    } catch {
      return null;
    }
  }

  // Start loading
  modelLoading = (async () => {
    try {
      // Dynamically import TF.js (never bundled on native)
      const depsLoaded = await loadDeps();
      if (!depsLoaded || !tf || !nsfwjs) {
        throw new Error('TF.js dependencies not available');
      }

      // Ensure TensorFlow.js backend is ready
      await tf.ready();

      // Load the MobileNet v2 quantized model (~2.6MB)
      // Uses the default CDN-hosted model for reliability
      const loadedModel = await nsfwjs.load();

      model = loadedModel;
      console.log('[NSFW] Model loaded successfully');
      return loadedModel;
    } catch (error) {
      console.error('[NSFW] Failed to load model:', error);
      modelLoadFailed = true;
      throw error;
    }
  })();

  try {
    return await modelLoading;
  } catch {
    return null;
  }
}

/**
 * Convert a File to an HTMLImageElement for NSFWJS
 */
async function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Convert predictions array to a scores object
 */
function predictionsToScores(predictions: NSFWPrediction[]): Record<NSFWCategory, number> {
  const scores: Record<NSFWCategory, number> = {
    Drawing: 0,
    Hentai: 0,
    Neutral: 0,
    Porn: 0,
    Sexy: 0,
  };

  for (const pred of predictions) {
    scores[pred.className] = pred.probability;
  }

  return scores;
}

/**
 * Check if any category exceeds its threshold
 */
function checkThresholds(scores: Record<NSFWCategory, number>): NSFWCategory | null {
  for (const [category, threshold] of Object.entries(THRESHOLDS)) {
    const score = scores[category as NSFWCategory];
    if (score > threshold) {
      return category as NSFWCategory;
    }
  }
  return null;
}

/**
 * Scan an image file for NSFW content
 *
 * @param file - The image file to scan
 * @returns NSFWScanResult with pass/fail status and details
 */
export async function scanImage(file: File): Promise<NSFWScanResult> {
  // Load model if not already loaded
  const nsfwModel = await loadNSFWModel();

  // If model failed to load, allow upload but flag for manual review
  if (!nsfwModel) {
    return {
      passed: true,
      modelAvailable: false,
      scores: { Drawing: 0, Hentai: 0, Neutral: 0, Porn: 0, Sexy: 0 },
      failedCategory: null,
      requiresManualReview: true,
      message: null,
    };
  }

  try {
    // Convert file to image element
    const img = await fileToImage(file);

    // Run NSFW classification
    const predictions = await nsfwModel.classify(img) as NSFWPrediction[];

    // Convert to scores object
    const scores = predictionsToScores(predictions);

    // Check against thresholds
    const failedCategory = checkThresholds(scores);

    if (failedCategory) {
      return {
        passed: false,
        modelAvailable: true,
        scores,
        failedCategory,
        requiresManualReview: false,
        message: BLOCK_MESSAGES[failedCategory] ||
          "This photo can't be used as a public profile photo. Try a different image.",
      };
    }

    // Passed all checks
    return {
      passed: true,
      modelAvailable: true,
      scores,
      failedCategory: null,
      requiresManualReview: false,
      message: null,
    };

  } catch (error) {
    console.error('[NSFW] Scan failed:', error);
    // On scan error, allow upload but flag for manual review
    return {
      passed: true,
      modelAvailable: true,
      scores: { Drawing: 0, Hentai: 0, Neutral: 0, Porn: 0, Sexy: 0 },
      failedCategory: null,
      requiresManualReview: true,
      message: null,
    };
  }
}

/**
 * Preload the NSFW model on app startup
 * Call this early in app initialization to avoid delay on first photo upload.
 * Skips entirely on native platforms to prevent WKWebView memory pressure.
 */
export function preloadNSFWModel(): void {
  // Skip on native — TF.js causes crashes in WKWebView
  if (isNative()) return;

  // Fire and forget - load in background
  loadNSFWModel().catch(() => {
    // Silently handle - modelLoadFailed flag is set internally
  });
}

/**
 * Check if the model is currently available
 */
export function isModelAvailable(): boolean {
  return model !== null && !modelLoadFailed;
}

/**
 * Check if the model is still loading
 */
export function isModelLoading(): boolean {
  return modelLoading !== null && model === null && !modelLoadFailed;
}
