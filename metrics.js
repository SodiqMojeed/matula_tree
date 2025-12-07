// metrics.js
// Translated from tree_statistics.py to JavaScript
// Optimized with memoization and a simple incremental prime cache.

// -----------------------------
// Prime utilities + caching
// -----------------------------
const PrimeCache = {
  primes: [2, 3],        // list of primes discovered
  maxChecked: 3,         // highest integer we've tested for primality
  isPrimeCache: new Map()
};

function ensurePrimesUpTo(limit) {
  // Incrementally extend prime list and isPrimeCache up to `limit`
  if (limit <= PrimeCache.maxChecked) return;
  for (let num = PrimeCache.maxChecked + 1; num <= limit; num++) {
    let prime = true;
    const r = Math.floor(Math.sqrt(num));
    for (let p of PrimeCache.primes) {
      if (p > r) break;
      if (num % p === 0) {
        prime = false;
        break;
      }
    }
    if (prime) PrimeCache.primes.push(num);
    PrimeCache.maxChecked = num;
    PrimeCache.isPrimeCache.set(num, prime);
  }
}

function isPrime(x) {
  if (x < 2) return false;
  if (PrimeCache.isPrimeCache.has(x)) return PrimeCache.isPrimeCache.get(x);
  // ensure primes known up to sqrt(x)
  ensurePrimesUpTo(Math.floor(Math.sqrt(x)) + 1);
  const r = Math.floor(Math.sqrt(x));
  for (let p of PrimeCache.primes) {
    if (p > r) break;
    if (x % p === 0) {
      PrimeCache.isPrimeCache.set(x, false);
      return false;
    }
  }
  PrimeCache.isPrimeCache.set(x, true);
  return true;
}

function isEven(x) {
  return x % 2 === 0;
}

// nthPrime is rarely needed in metrics, but provided for completeness
function nthPrime(n) {
  if (n <= 0) return null;
  // ensure we have enough primes
  let idx = PrimeCache.primes.length;
  let candidate = PrimeCache.maxChecked + 1;
  while (PrimeCache.primes.length < n) {
    ensurePrimesUpTo(candidate);
    if (PrimeCache.primes.length >= n) break;
    // double-check primality of candidate (will be done in ensurePrimesUpTo loop)
    candidate++;
  }
  return PrimeCache.primes[n - 1];
}

const primePositionCache = new Map();
function primePosition(p) {
  if (!isPrime(p)) return null;
  if (primePositionCache.has(p)) return primePositionCache.get(p);

  // Ensure prime list includes p
  if (PrimeCache.maxChecked < p) ensurePrimesUpTo(p);
  // find index
  let pos = 0;
  for (let prime of PrimeCache.primes) {
    pos++;
    if (prime === p) {
      primePositionCache.set(p, pos);
      return pos;
    }
  }
  // fallback (shouldn't get here if ensurePrimesUpTo worked)
  for (let num = 2; num <= p; num++) {
    if (isPrime(num)) pos++;
    if (num === p) break;
  }
  primePositionCache.set(p, pos);
  return pos;
}

// -----------------------------
// Factor utilities (memoized)
// -----------------------------
const lowestFactorCache = new Map();

function lowestFactor(n) {
  if (lowestFactorCache.has(n)) return lowestFactorCache.get(n);
  if (n <= 3) {
    lowestFactorCache.set(n, undefined);
    return undefined;
  }
  const r = Math.floor(Math.sqrt(n));
  // ensure primes up to r for speed
  ensurePrimesUpTo(r + 1);
  for (let p of PrimeCache.primes) {
    if (p > r) break;
    if (n % p === 0) {
      lowestFactorCache.set(n, p);
      return p;
    }
  }
  // If no prime divisor found, n is prime, return undefined
  lowestFactorCache.set(n, undefined);
  return undefined;
}

const numPrimeFactorsCache = new Map();
function numberOfPrimeFactors(n) {
  if (numPrimeFactorsCache.has(n)) return numPrimeFactorsCache.get(n);
  let orig = n;
  let count = 0;
  let factor = 2;
  // small trial division using prime cache
  ensurePrimesUpTo(Math.floor(Math.sqrt(n)) + 1);
  for (let p of PrimeCache.primes) {
    if (p * p > n) break;
    while (n % p === 0) {
      count++;
      n = Math.floor(n / p);
    }
  }
  if (n > 1) count++;
  numPrimeFactorsCache.set(orig, count);
  return count;
}

// -----------------------------
// Memoization wrapper for all metrics
// -----------------------------
function memoize(fn) {
  const m = new Map();
  return function(n) {
    if (m.has(n)) return m.get(n);
    const val = fn(n);
    m.set(n, val);
    return val;
  };
}

// -----------------------------
// Metric functions (translated from Python)
// -----------------------------

const vertices = memoize(function vert(n) {
  if (n === 1) return 1;
  if (isPrime(n)) {
    const t = primePosition(n);
    return 1 + vert(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return vert(a) + vert(b) - 1;
});

const leaves = memoize(function leaf(n) {
  if (n === 1) return 0;
  if (n === 2) return 1;
  if (isPrime(n) && primePosition(n) >= 2) {
    const t = primePosition(n);
    return leaf(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return leaf(a) + leaf(b);
});

const pendentVertices = memoize(function pv(n) {
  if (n === 1) return 0;
  if (n === 2) return 2;
  if (isPrime(n) && primePosition(n) >= 2) {
    const t = primePosition(n);
    return 1 + leaves(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return leaves(a) + leaves(b);
});

const edges = memoize(function ed(n) {
  if (n === 1) return 0;
  if (isPrime(n)) {
    const t = primePosition(n);
    return 1 + ed(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return ed(a) + ed(b);
});

const numberRootSubtrees = memoize(function nrs(n) {
  if (n === 1) return 1;
  if (isPrime(n)) {
    const t = primePosition(n);
    return 1 + nrs(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return nrs(a) * nrs(b);
});

const numberSubtrees = memoize(function ns(n) {
  if (n === 1) return 1;
  if (isPrime(n)) {
    const t = primePosition(n);
    return 1 + ns(t) + numberRootSubtrees(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return ns(a) + ns(b) + (numberRootSubtrees(a) - 1) * (numberRootSubtrees(b) - 1) - 1;
});

const numberBranchingVertices = memoize(function nbv(n) {
  if (n <= 2) return 0;
  if (isPrime(n)) {
    const t = primePosition(n);
    const f = numberOfPrimeFactors(t);
    if (f === 1) return nbv(t);
    if (f === 2) return 1 + nbv(t);
    if (f >= 3) return nbv(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  const fa = numberOfPrimeFactors(a);
  const fb = numberOfPrimeFactors(b);

  if (fa >= 3 && fa <= fb)
    return nbv(a) + nbv(b) - 1;

  if (fa <= 2 && fb >= 3)
    return nbv(a) + nbv(b);

  if (fa <= fb && fb <= 2) {
    if (fb === 1) return nbv(a) + nbv(b);
    if (fb === 2) return 1 + nbv(a) + nbv(b);
  }
  return 0; // fallback
});

const numberSiblingPairs = memoize(function nsp(n) {
  if (n === 1) return 0;
  if (isPrime(n)) {
    const t = primePosition(n);
    return nsp(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return nsp(a) + nsp(b) + numberOfPrimeFactors(a) * numberOfPrimeFactors(b);
});

const height = memoize(function h(n) {
  if (n === 1) return 0;
  if (isPrime(n)) {
    const t = primePosition(n);
    return 1 + h(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return Math.max(h(a), h(b));
});

const eccentricityOfRoot = memoize(function eor(n) {
  if (n === 1) return 0;
  if (isPrime(n)) {
    const t = primePosition(n);
    return 1 + eor(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return Math.max(eor(a), eor(b));
});

const levelOfLowestLeaf = memoize(function loll(n) {
  if (n === 1) return 0;
  if (isPrime(n)) {
    const t = primePosition(n);
    return 1 + loll(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return Math.min(loll(a), loll(b));
});

const pathLength = memoize(function pl(n) {
  if (n === 1) return 0;
  if (isPrime(n)) {
    const t = primePosition(n);
    return pl(t) + vertices(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return pl(a) + pl(b);
});

const externalPathLength = memoize(function epl(n) {
  if (n === 1) return 0;
  if (n === 2) return 1;
  if (isPrime(n) && primePosition(n) >= 2) {
    const t = primePosition(n);
    return epl(t) + leaves(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return epl(a) + epl(b);
});

const internalPathLength = memoize(function ipl(n) {
  if (n <= 2) return 0;
  if (isPrime(n) && primePosition(n) >= 2) {
    const t = primePosition(n);
    return ipl(t) + vertices(t) - leaves(t);
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return ipl(a) + ipl(b);
});

const diameter = memoize(function diam(n) {
  if (n === 1) return 0;
  if (isPrime(n)) {
    const t = primePosition(n);
    return Math.max(diam(t), 1 + height(t));
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return Math.max(diam(a), diam(b), height(a) + height(b));
});

const visitationLength = memoize(function vl(n) {
  if (n === 1) return 1;
  if (isPrime(n)) {
    const t = primePosition(n);
    return vl(t) + vertices(t) + 1;
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return vl(a) + vl(b) - 1;
});

const maximumVertexDegree = memoize(function mvd(n) {
  if (n === 1) return 0;
  if (isPrime(n)) {
    const t = primePosition(n);
    return Math.max(maximumVertexDegree(t), 1 + numberOfPrimeFactors(t));
  }
  const a = lowestFactor(n);
  const b = Math.floor(n / a);
  return Math.max(maximumVertexDegree(a), maximumVertexDegree(b), numberOfPrimeFactors(a) + numberOfPrimeFactors(b));
});

// -----------------------------
// Exported wrapper: computeAllMetrics(n)
// -----------------------------
function computeAllMetrics(n) {
  if (!Number.isInteger(n) || n < 1) throw new Error("n must be integer >= 1");

  // Pre-warm prime cache to sqrt(n) to speed many metric calls
  ensurePrimesUpTo(Math.floor(Math.sqrt(n)) + 100);

  return {
    n,
    vertices: vertices(n),
    leaves: leaves(n),
    pendentVertices: pendentVertices(n),
    edges: edges(n),
    numberRootSubtrees: numberRootSubtrees(n),
    numberSubtrees: numberSubtrees(n),
    numberBranchingVertices: numberBranchingVertices(n),
    numberSiblingPairs: numberSiblingPairs(n),
    height: height(n),
    eccentricityOfRoot: eccentricityOfRoot(n),
    levelOfLowestLeaf: levelOfLowestLeaf(n),
    pathLength: pathLength(n),
    externalPathLength: externalPathLength(n),
    internalPathLength: internalPathLength(n),
    diameter: diameter(n),
    visitationLength: visitationLength(n),
    maximumVertexDegree: maximumVertexDegree(n),
    numberOfPrimeFactors: numberOfPrimeFactors(n)
  };
}

// Attach to window for browser usage
window.Metrics = {
  computeAllMetrics,
  // Also expose individual functions if you want
  isPrime,
  primePosition,
  numberOfPrimeFactors,
  vertices,
  leaves,
  edges,
  height
};
