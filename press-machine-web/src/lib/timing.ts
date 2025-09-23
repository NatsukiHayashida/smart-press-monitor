/**
 * パフォーマンス計測ヘルパー
 * サンプリング付きで本番環境でのログ量を抑制
 */
export async function withTiming<T>(
  label: string,
  fn: () => Promise<T>,
  sample: number = 1
): Promise<T> {
  // サンプリング（デフォルトは100%記録）
  if (Math.random() > sample) {
    return fn();
  }

  const startTime = performance.now();

  try {
    const result = await fn();
    return result;
  } finally {
    const duration = Math.round(performance.now() - startTime);

    // パフォーマンス警告（SLO: 400ms）
    const isWarning = duration > 400;
    const emoji = isWarning ? '⚠️' : '✅';

    console.log(
      `[TIMING] ${emoji} ${label}: ${duration}ms${isWarning ? ' (SLO exceeded)' : ''}`
    );
  }
}

/**
 * 同期処理用の計測ヘルパー
 */
export function withTimingSync<T>(
  label: string,
  fn: () => T,
  sample: number = 1
): T {
  if (Math.random() > sample) {
    return fn();
  }

  const startTime = performance.now();

  try {
    const result = fn();
    return result;
  } finally {
    const duration = Math.round(performance.now() - startTime);
    console.log(`[TIMING] ${label}: ${duration}ms`);
  }
}

/**
 * パフォーマンスメトリクスの集計
 */
export class PerformanceMetrics {
  private static metrics: Map<string, number[]> = new Map();

  static record(label: string, duration: number) {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    const values = this.metrics.get(label)!;
    values.push(duration);

    // 最新100件のみ保持
    if (values.length > 100) {
      values.shift();
    }
  }

  static getStats(label: string) {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  static logAllStats() {
    console.log('=== Performance Metrics Summary ===');
    for (const [label, values] of this.metrics.entries()) {
      if (values.length > 0) {
        const stats = this.getStats(label);
        console.log(`${label}:`, stats);
      }
    }
  }
}