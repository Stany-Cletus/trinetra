import random
from collections import deque

HEIGHT = 15
WIDTH = 35

def make_maze(height, width):
    grid = [['#' for _ in range(width)] for _ in range(height)]
    start = (1, 1)
    grid[start[0]][start[1]] = '.'
    stack = [start]
    visited = {start}
    directions = [(0, 2), (0, -2), (2, 0), (-2, 0)]
    while stack:
        cell = stack[-1]
        random.shuffle(directions)
        carved = False
        for dr, dc in directions:
            nr, nc = cell[0] + dr, cell[1] + dc
            between = (cell[0] + dr // 2, cell[1] + dc // 2)
            if 0 < nr < height-1 and 0 < nc < width-1 and (nr, nc) not in visited:
                visited.add((nr, nc))
                grid[nr][nc] = '.'
                grid[between[0]][between[1]] = '.'
                stack.append((nr, nc))
                carved = True
                break
        if not carved:
            stack.pop()
    return grid

for seed in range(10):
    random.seed(seed)
    grid = make_maze(HEIGHT, WIDTH)
    start = (1, 1)
    goal = (HEIGHT - 2, WIDTH - 2)
    grid[start[0]][start[1]] = 'S'
    grid[goal[0]][goal[1]] = 'G'
    layout = [''.join(row) for row in grid]
    q = deque([start])
    visited = {start}
    while q:
        r,c = q.popleft()
        if (r,c)==goal:
            break
        for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            nr, nc = r+dr, c+dc
            if 0<=nr<HEIGHT and 0<=nc<WIDTH and layout[nr][nc] != '#' and (nr,nc) not in visited:
                visited.add((nr,nc))
                q.append((nr,nc))
    if goal in visited:
        print('seed', seed)
        for row in layout:
            print(row)
        break
