import json
import heapq
from geopy.distance import geodesic

def bfs_search(filepath, START, TARGET):
    """
    Breadth-First Search
    """

    with open(filepath, mode='r', encoding='utf8') as fr:
        data = json.load(fr)

    node_lookup = {node['code']: node for node in data}
    cur_node = START
    Open = []
    Close = []
    Path = {}

    while cur_node != TARGET:
        if cur_node not in node_lookup:
            raise KeyError(f"Node '{cur_node}' not found in lookup.")
        node = node_lookup[cur_node]
        neighbors = node['neighbors']
        for neighbor in neighbors:
            neighbor_name = neighbor['code']
            if neighbor_name not in Open and neighbor_name not in Close:
                Open.append(neighbor_name)
                Path[neighbor_name] = cur_node
        if cur_node not in Close:
            Close.append(cur_node)
        if Open:
            cur_node = Open.pop(0)
        else:
            raise KeyError(f"No path found from '{START}' to '{TARGET}'.")

    path = []
    step = TARGET
    if step not in Path and step != START:
        raise KeyError(f"Path to '{TARGET}' could not be constructed.")
    while step != START:
        path.append(step)
        step = Path.get(step, None)
        if step is None:
            raise KeyError(f"Path construction failed at node '{step}'.")
    path.append(START)
    path.reverse()

    # Calculate distance along the path
    total_distance = sum([
        geodesic(
            (node_lookup[path[i-1]]['latitude'],node_lookup[path[i-1]]['longitude']),   # 1st Point
            (node_lookup[path[i]]['latitude'],node_lookup[path[i]]['longitude']),       # 2nd Point
        ).km
        for i in range(1,len(path))
    ])

    # Calculate straight distance from start to end
    start_node = node_lookup[START]
    target_node = node_lookup[TARGET]
    straight_line_distance = geodesic(
        (start_node['latitude'], start_node['longitude']),
        (target_node['latitude'], target_node['longitude']),
    ).km

    return {
        'distance': round(total_distance, 2),
        'straight': round(straight_line_distance, 2),
        'points': [{
            'code': code,
            'name': node_lookup[code]['name_km'],
            'longitude': node_lookup[code]['longitude'],
            'latitude': node_lookup[code]['latitude']
        } for code in path]
    }


def dfs_search(filepath, START, TARGET):
    """
    Depth-First Search
    """

    with open(filepath, mode='r', encoding='utf8') as fr:
        data = json.load(fr)

    node_lookup = {node['code']: node for node in data}
    stack = [(START, 0)]
    visited = set()
    Path = {}
    total_distance = 0.0

    while stack:
        current_node, current_dis = stack.pop()
        if current_node in visited:
            continue
        visited.add(current_node)
        if current_node == TARGET:
            total_distance = current_dis
            break
        for neighbor in node_lookup[current_node]['neighbors']:
            neighbor_name = neighbor['code']
            distance = neighbor['distance']
            if neighbor_name not in visited:
                stack.append((neighbor_name, current_dis + distance))
                Path[neighbor_name] = current_node

    path = []
    step = TARGET
    while step != START:
        path.append(step)
        step = Path.get(step, None)
        if step is None:
            return {"error": "Path not found"}
    path.append(START)
    path.reverse()

    # Calculate straight distance from start to end
    start_node = node_lookup[START]
    target_node = node_lookup[TARGET]
    straight_line_distance = geodesic(
        (start_node['latitude'], start_node['longitude']),
        (target_node['latitude'], target_node['longitude']),
    ).km

    return {
        'distance': round(total_distance, 2),
        'straight': round(straight_line_distance, 2),
        'points': [{
            'code': code,
            'name': node_lookup[code]['name_km'],
            'longitude': node_lookup[code]['longitude'],
            'latitude': node_lookup[code]['latitude']
        } for code in path]
    }

def gbfs_search(filepath, START, TARGET):
    """
    Greedy Best First Search
    """

    with open(filepath, mode='r', encoding='utf8') as fr:
        data = json.load(fr)

    node_lookup = {node['code']: node for node in data}
    priority_queue = [(0, START)]
    visited = set()
    Path = {}
    total_distance = 0.0

    def heuristic(node_code):
        target_node = node_lookup[TARGET]
        cur_node = node_lookup[node_code]
        return geodesic(
            (cur_node['latitude'], cur_node['longitude']),
            (target_node['latitude'], target_node['longitude']),
        ).km


    while priority_queue:
        _, cur_node = heapq.heappop(priority_queue)
        if cur_node in visited:
            continue
        visited.add(cur_node)
        if cur_node == TARGET:
            break
        for neighbor in node_lookup[cur_node]['neighbors']:
            neighbor_name = neighbor['code']
            distance = neighbor['distance']
            if neighbor_name not in visited:
                heapq.heappush(priority_queue, (heuristic(neighbor_name), neighbor_name))
                Path[neighbor_name] = cur_node
                total_distance += distance # maybe wrong

    path = []
    step = TARGET
    while step != START:
        path.append(step)
        step = Path.get(step, None)
        if step is None:
            return {"error": "Path not found"}
    path.append(START)
    path.reverse()

    # Calculate distance along the path
    total_distance = sum([
        geodesic(
            (node_lookup[path[i-1]]['latitude'],node_lookup[path[i-1]]['longitude']),
            (node_lookup[path[i]]['latitude'],node_lookup[path[i]]['longitude']),
        ).km
        for i in range(1,len(path))
    ])

    # Calculate straight distance from start to end
    start_node = node_lookup[START]
    target_node = node_lookup[TARGET]
    straight_line_distance = geodesic(
        (start_node['latitude'], start_node['longitude']),
        (target_node['latitude'], target_node['longitude']),
    ).km

    return {
        'distance': round(total_distance, 2),
        'straight': round(straight_line_distance, 2),
        'points': [{
            'code': code,
            'name': node_lookup[code]['name_km'],
            'longitude': node_lookup[code]['longitude'],
            'latitude': node_lookup[code]['latitude']
        } for code in path]
    }


def astar_search(filepath, START, TARGET):
    """
    A* Search
    """

    with open(filepath, mode='r', encoding='utf8') as fr:
        data = json.load(fr)

    node_lookup = {node['code']: node for node in data}
    priority_queue = [(0, START)]
    g_scores = {node['code']: float('inf') for node in data}
    g_scores[START] = 0
    Path = {}

    def heuristic(node_code):
        target_node = node_lookup[TARGET]
        cur_node = node_lookup[node_code]
        return geodesic(
            (cur_node['latitude'], cur_node['longitude']),
            (target_node['latitude'], target_node['longitude']),
        ).km

    while priority_queue:
        _, cur_node = heapq.heappop(priority_queue)
        if cur_node == TARGET:
            break
        for neighbor in node_lookup[cur_node]['neighbors']:
            neighbor_name = neighbor['code']
            distance = neighbor['distance']
            tentative_g_score = g_scores[cur_node] + distance
            if tentative_g_score < g_scores[neighbor_name]:
                g_scores[neighbor_name] = tentative_g_score
                f_score = tentative_g_score + heuristic(neighbor_name)
                heapq.heappush(priority_queue, (f_score, neighbor_name))
                Path[neighbor_name] = cur_node

    path = []
    step = TARGET
    while step != START:
        path.append(step)
        step = Path.get(step, None)
        if step is None:
            return {"error": "Path not found"}
    path.append(START)
    path.reverse()

    total_distance = g_scores[TARGET]

    # Calculate straight distance from start to end
    start_node = node_lookup[START]
    target_node = node_lookup[TARGET]
    straight_line_distance = geodesic(
        (start_node['latitude'], start_node['longitude']),
        (target_node['latitude'], target_node['longitude']),
    ).km

    return {
        'distance': round(total_distance, 2),
        'straight': round(straight_line_distance, 2),
        'points': [{
            'code': code,
            'name': node_lookup[code]['name_km'],
            'longitude': node_lookup[code]['longitude'],
            'latitude': node_lookup[code]['latitude']
        } for code in path]
    }
