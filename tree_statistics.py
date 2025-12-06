# Functions: prime number, factorization, and index
def is_prime(x):
    if x < 2:
        return False
    for i in range(2, int(x**0.5) + 1):
        if x % i == 0:
            return False
    return True

def is_even(x):
    if x % 2 == 0:
        return True
    else:
        return False

def nth_prime(n):
    count = 0
    num = 1
    while count < n:
        num += 1
        if is_prime(num):
            count += 1
    return num

def prime_position(p):
    """Return the position of prime p in the sequence of primes."""
    if not is_prime(p):
        return None   # p is not a prime number

    count = 0
    num = 1
    while num <= p:
        num += 1
        if is_prime(num):
            count += 1
        if num == p:
            return count

def lowest_factor(n):
    # n is assumed to be a composite integer
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return i

# Number of prime factors with multiplicity
def number_of_prime_factors(n):
    count = 0
    factor = 2

    while factor * factor <= n:
        while n % factor == 0:
            count += 1
            n = n // factor
        factor += 1

    # If n > 1 here, then n itself is a prime factor; e.g, 2,3,5, etc.
    if n > 1:
        count += 1

    return count

# Number of vertices
def vertices(n):
    if n == 1:
        return 1
    elif is_prime(n):
        t = prime_position(n)
        return 1 + vertices(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return vertices(a) + vertices(b) - 1

# Number of leaves
def leaves(n):
    if n == 1:
        return 0
    elif n == 2:
        return 1
    elif is_prime(n) and prime_position(n) >= 2:
        t = prime_position(n)
        return leaves(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return leaves(a) + leaves(b)

# Number of pendent vertices
def pendent_vertices(n):
  if n == 1:
      return 0
  elif n == 2:
      return 2
  elif is_prime(n) and prime_position(n) >= 2:
      t = prime_position(n)
      return 1 + leaves(t)
  else:
      a = lowest_factor(n)
      b = int(n / a)
      return leaves(a) + leaves(b)

# Number of edges
def edges(n):
    if n == 1:
        return 0
    elif is_prime(n):
        t = prime_position(n)
        return 1 + edges(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return edges(a) + edges(b)

# Number of root subtrees
def number_root_subtrees(n):
    if n == 1:
        return 1
    elif is_prime(n):
        t = prime_position(n)
        return 1 + number_root_subtrees(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return number_root_subtrees(a) * number_root_subtrees(b)

# Number of subtrees
def number_subtrees(n):
    if n == 1:
        return 1
    elif is_prime(n):
        t = prime_position(n)
        return 1 + number_subtrees(t) + number_root_subtrees(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return number_subtrees(a) + number_subtrees(b) + (number_root_subtrees(a) - 1) * (number_root_subtrees(b) - 1) - 1

# Number of branching vertices
def number_branching_vertices(n):
    if n <= 2:
        return 0
    elif is_prime(n):
        t = prime_position(n)
        if number_of_prime_factors(t) == 1:
            return number_branching_vertices(t)
        if number_of_prime_factors(t) == 2:
            return 1 + number_branching_vertices(t)
        if number_of_prime_factors(t) >= 3:
            return number_branching_vertices(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        if number_of_prime_factors(a) >= 3 and number_of_prime_factors(a) <= number_of_prime_factors(b):
            return number_branching_vertices(a) + number_branching_vertices(b) - 1
        if number_of_prime_factors(a) <= 2 and number_of_prime_factors(b) >= 3:
            return number_branching_vertices(a) + number_branching_vertices(b)
        if number_of_prime_factors(a) <= number_of_prime_factors(b) and number_of_prime_factors(b) <= 2:
            if number_of_prime_factors(b) == 1:
                return number_branching_vertices(a) + number_branching_vertices(b)
            if number_of_prime_factors(b) == 2:
                return 1 + number_branching_vertices(a) + number_branching_vertices(b)

# Number of sibling pairs
def number_of_sibling_pairs(n):
    if n == 1:
        return 0
    elif is_prime(n):
        t = prime_position(n)
        return number_of_sibling_pairs(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return number_of_sibling_pairs(a) + number_of_sibling_pairs(b) + (number_of_prime_factors(a) * number_of_prime_factors(b))

# Height
def height(n):
    if n == 1:
        return 0
    elif is_prime(n):
        t = prime_position(n)
        return 1 + height(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return max(height(a), height(b))

# Eccentricity of the root
def eccentricity_of_the_root(n):
    if n == 1:
        return 0
    elif is_prime(n):
        t = prime_position(n)
        return 1 + eccentricity_of_the_root(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return max(eccentricity_of_the_root(a), eccentricity_of_the_root(b))

# Level of the lowest leaf
def level_of_lowest_leaf(n):
    if n == 1:
        return 0
    elif is_prime(n):
        t = prime_position(n)
        return 1 + level_of_lowest_leaf(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return min(level_of_lowest_leaf(a), level_of_lowest_leaf(b))

# Path length
def path_length(n):
    if n == 1:
        return 0
    elif is_prime(n):
        t = prime_position(n)
        return path_length(t) + vertices(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return path_length(a) + path_length(b)

# External path length
def external_path_length(n):
    if n == 1:
        return 0
    elif n == 2:
        return 1
    elif is_prime(n) and prime_position(n) >= 2:
        t = prime_position(n)
        return external_path_length(t) + leaves(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return external_path_length(a) + external_path_length(b)

# Internal path length
def internal_path_length(n):
    if n <= 2:
        return 0
    elif is_prime(n) and prime_position(n) >= 2:
        t = prime_position(n)
        return internal_path_length(t) + vertices(t) - leaves(t)
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return internal_path_length(a) + internal_path_length(b)

# Diameter
def diameter(n):
    if n == 1:
        return 0
    elif is_prime(n):
        t = prime_position(n)
        return max(diameter(t), 1 + height(t))
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return max(diameter(a), diameter(b), height(a) + height(b))

# Visitation length
def visitation_length(n):
    if n == 1:
        return 1
    elif is_prime(n):
        t = prime_position(n)
        return visitation_length(t) + vertices(t) + 1
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return visitation_length(a) + visitation_length(b) - 1

# Maximum vertex degree
def maximum_vertex_degree(n):
    if n == 1:
        return 0
    elif is_prime(n):
        t = prime_position(n)
        return max(maximum_vertex_degree(t), 1 + number_of_prime_factors(t))
    else:
        a = lowest_factor(n)
        b = int(n / a)
        return max(maximum_vertex_degree(a), maximum_vertex_degree(b), number_of_prime_factors(a) + number_of_prime_factors(b))
