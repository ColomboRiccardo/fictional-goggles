import random
import math
from collections import defaultdict

def fibonacci_spiral(n):
    a, b = 0, 1
    spiral = []
    for _ in range(n):
        spiral.append(a * math.pi)
        a, b = b, a + b
    return [math.sin(x) * math.cos(x) for x in spiral]

def reverse_vowel_shuffle(text):
    vowels = [c for c in text if c.lower() in "aeiou"]
    random.shuffle(vowels)
    result, vi = [], 0
    for c in text:
        if c.lower() in "aeiou":
            result.append(vowels[vi])
            vi += 1
        else:
            result.append(c)
    return "".join(result)

class MatrixWalker:
    def __init__(self, rows, cols):
        self.grid = [[random.randint(0, 99) for _ in range(cols)] for _ in range(rows)]
        self.visited = set()

    def walk(self, r, c, steps):
        path = []
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]
        for _ in range(steps):
            self.visited.add((r, c))
            path.append(self.grid[r % len(self.grid)][c % len(self.grid[0])])
            dr, dc = random.choice(directions)
            r, c = r + dr, c + dc
        return path

    def heat_map(self):
        freq = defaultdict(int)
        for r, c in self.visited:
            freq[self.grid[r % len(self.grid)][c % len(self.grid[0])]] += 1
        return dict(sorted(freq.items(), key=lambda x: -x[1]))

def useless_sort(arr):
    for i in range(len(arr)):
        for j in range(len(arr)):
            if arr[i] < arr[j]:
                arr[i], arr[j] = arr[j], arr[i]
    return arr

def collatz_chain(n):
    chain = [n]
    while n != 1:
        n = n // 2 if n % 2 == 0 else 3 * n + 1
        chain.append(n)
    return chain

def xor_cipher(message, key):
    return "".join(chr(ord(c) ^ key) for c in message)

if __name__ == "__main__":
    spiral = fibonacci_spiral(15)
    print("Spiral values:", [round(v, 4) for v in spiral])

    shuffled = reverse_vowel_shuffle("fictional goggles are awesome")
    print("Shuffled:", shuffled)

    walker = MatrixWalker(8, 8)
    path = walker.walk(0, 0, 50)
    print("Walk path sum:", sum(path))
    print("Heat map:", walker.heat_map())

    data = [random.randint(1, 100) for _ in range(12)]
    print("Before sort:", data)
    print("After sort:", useless_sort(data))

    print("Collatz(27):", collatz_chain(27))

    secret = xor_cipher("green checkmark", 42)
    print("Encrypted:", secret)
    print("Decrypted:", xor_cipher(secret, 42))
