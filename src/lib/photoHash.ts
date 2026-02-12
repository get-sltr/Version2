/**
 * Photo Hash Utility
 *
 * Computes a perceptual hash (pHash) of an image for duplicate detection.
 * Used to prevent re-upload of rejected/moderated photos.
 *
 * How it works:
 * 1. Resize image to 32x32 grayscale
 * 2. Compute average pixel value
 * 3. Generate binary hash: each pixel is 1 if above average, 0 if below
 * 4. Convert to hex string
 *
 * This is a simplified perceptual hash — it catches exact re-uploads and
 * minor edits (crops, brightness changes, compression artifacts).
 */

import { supabase } from '@/lib/supabase';

const HASH_SIZE = 16; // 16x16 = 256-bit hash

/**
 * Compute a perceptual hash of an image file
 */
export async function computePhotoHash(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Create small grayscale version
        const canvas = document.createElement('canvas');
        canvas.width = HASH_SIZE;
        canvas.height = HASH_SIZE;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw resized image
        ctx.drawImage(img, 0, 0, HASH_SIZE, HASH_SIZE);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, HASH_SIZE, HASH_SIZE);
        const pixels = imageData.data;

        // Convert to grayscale values
        const grayscale: number[] = [];
        for (let i = 0; i < pixels.length; i += 4) {
          // Standard luminance formula
          const gray = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
          grayscale.push(gray);
        }

        // Compute average
        const avg = grayscale.reduce((sum, val) => sum + val, 0) / grayscale.length;

        // Generate hash: 1 if pixel >= average, 0 if below
        let hashBits = '';
        for (const val of grayscale) {
          hashBits += val >= avg ? '1' : '0';
        }

        // Convert binary string to hex
        let hexHash = '';
        for (let i = 0; i < hashBits.length; i += 4) {
          const nibble = hashBits.substring(i, i + 4);
          hexHash += parseInt(nibble, 2).toString(16);
        }

        URL.revokeObjectURL(url);
        resolve(hexHash);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for hashing'));
    };

    img.src = url;
  });
}

/**
 * Check if a photo hash exists in the rejected hashes table
 * Returns true if the photo has been previously rejected
 */
export async function isPhotoRejected(hash: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('rejected_photo_hashes')
      .select('id')
      .eq('hash', hash)
      .limit(1);

    if (error) {
      console.error('[PhotoHash] Error checking rejected hash:', error);
      // On error, allow the upload (fail open) — manual review will catch it
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch (err) {
    console.error('[PhotoHash] Exception checking rejected hash:', err);
    return false;
  }
}

/**
 * Add a photo hash to the rejected list (called by admin when rejecting a photo)
 * Requires service role or admin privileges
 */
export async function addRejectedPhotoHash(
  hash: string,
  userId: string,
  photoPath: string,
  rejectedBy: string,
  reason: string = 'nsfw'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('rejected_photo_hashes')
      .upsert({
        hash,
        original_user_id: userId,
        original_photo_path: photoPath,
        rejected_by: rejectedBy,
        reason,
      }, {
        onConflict: 'hash',
      });

    if (error) {
      console.error('[PhotoHash] Error adding rejected hash:', error);
      return false;
    }

    console.log('[PhotoHash] Added rejected hash:', hash.substring(0, 8) + '...');
    return true;
  } catch (err) {
    console.error('[PhotoHash] Exception adding rejected hash:', err);
    return false;
  }
}

/**
 * Compute hamming distance between two hashes
 * Lower = more similar. 0 = identical.
 * Threshold of ~10 catches minor edits.
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return Infinity;

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const bits1 = parseInt(hash1[i], 16);
    const bits2 = parseInt(hash2[i], 16);
    // Count differing bits
    let xor = bits1 ^ bits2;
    while (xor) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

/**
 * Check if a photo is similar to any rejected photo (fuzzy match)
 * Uses hamming distance with a threshold
 */
export async function isPhotoSimilarToRejected(
  hash: string,
  threshold: number = 10
): Promise<{ rejected: boolean; matchedHash?: string }> {
  try {
    const { data, error } = await supabase
      .from('rejected_photo_hashes')
      .select('hash');

    if (error || !data) {
      console.error('[PhotoHash] Error fetching rejected hashes:', error);
      return { rejected: false };
    }

    for (const row of data) {
      const distance = hammingDistance(hash, row.hash);
      if (distance <= threshold) {
        console.log(`[PhotoHash] Fuzzy match found: distance=${distance}, threshold=${threshold}`);
        return { rejected: true, matchedHash: row.hash };
      }
    }

    return { rejected: false };
  } catch (err) {
    console.error('[PhotoHash] Exception in fuzzy check:', err);
    return { rejected: false };
  }
}
