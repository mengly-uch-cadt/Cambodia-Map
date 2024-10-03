import json
import heapq
from geopy.distance import geodesic


def load_data(filepath):
    with open(filepath, mode='r', encoding='utf8') as fr:
        return json.load(fr)


def reconstruct_path(Path, START, TARGET):
    path = []
    step = TARGET
    while step != START:
        path.append(step)
        step = Path.get(step)
        if step is None:
            raise KeyError(f"Path construction failed at node '{step}'.")
    path.append(START)
    path.reverse()
    return path


def calculate_total_distance(path, node_lookup):
    total_distance = 0.0
    for i in range(len(path) - 1):
        start_node = node_lookup[path[i]]
        end_node = node_lookup[path[i + 1]]
        for neighbor in start_node['neighbors']:
            if neighbor['code'] == end_node['code']:
                total_distance += neighbor['distance']
                break
    return total_distance


def bfs_search(filepath, START, TARGET):
    data = load_data(filepath)
    node_lookup = {node['code']: node for node in data}

    Open = [START]
    Close = []
    Path = {}

    while Open:
        Cur_node = Open.pop(0)
        if Cur_node == TARGET:
            break

        if Cur_node not in node_lookup:
            raise KeyError(f"Node '{Cur_node}' not found in lookup.")

        for neighbor in node_lookup[Cur_node]['neighbors']:
            neighbor_name = neighbor['code']
            if neighbor_name not in Open and neighbor_name not in Close:
                Open.append(neighbor_name)
                Path[neighbor_name] = Cur_node

        Close.append(Cur_node)

    path = reconstruct_path(Path, START, TARGET)
    total_distance = calculate_total_distance(path, node_lookup)

    return create_result(path, total_distance, node_lookup, START, TARGET)


def dfs_search(filepath, START, TARGET):
    data = load_data(filepath)
    node_lookup = {node['code']: node for node in data}

    stack = [(START, 0)]
    visited = set()
    Path = {}

    while stack:
        current_node, current_dis = stack.pop()
        if current_node in visited:
            continue
        visited.add(current_node)
        if current_node == TARGET:
            break

        for neighbor in node_lookup[current_node]['neighbors']:
            neighbor_name = neighbor['code']
            if neighbor_name not in visited:
                stack.append((neighbor_name, current_dis + neighbor['distance']))
                Path[neighbor_name] = current_node

    path = reconstruct_path(Path, START, TARGET)
    total_distance = calculate_total_distance(path, node_lookup)

    return create_result(path, total_distance, node_lookup, START, TARGET)


def gbfs_search(filepath, START, TARGET):
    data = load_data(filepath)
    node_lookup = {node['code']: node for node in data}

    def heuristic(node_code):
        return geodesic(
            (node_lookup[node_code]['latitude'], node_lookup[node_code]['longitude']),
            (node_lookup[TARGET]['latitude'], node_lookup[TARGET]['longitude']),
        ).km

    priority_queue = [(0, START)]
    visited = set()
    Path = {}

    while priority_queue:
        _, cur_node = heapq.heappop(priority_queue)
        if cur_node in visited:
            continue
        visited.add(cur_node)
        if cur_node == TARGET:
            break

        for neighbor in node_lookup[cur_node]['neighbors']:
            neighbor_name = neighbor['code']
            if neighbor_name not in visited:
                heapq.heappush(priority_queue, (heuristic(neighbor_name), neighbor_name))
                Path[neighbor_name] = cur_node

    path = reconstruct_path(Path, START, TARGET)
    total_distance = calculate_total_distance(path, node_lookup)

    return create_result(path, total_distance, node_lookup, START, TARGET)


def astar_search(filepath, START, TARGET):
    data = load_data(filepath)
    node_lookup = {node['code']: node for node in data}

    def heuristic(node_code):
        return geodesic(
            (node_lookup[node_code]['latitude'], node_lookup[node_code]['longitude']),
            (node_lookup[TARGET]['latitude'], node_lookup[TARGET]['longitude']),
        ).km

    g_scores = {node['code']: float('inf') for node in data}
    g_scores[START] = 0
    priority_queue = [(0, START)]
    Path = {}

    while priority_queue:
        _, cur_node = heapq.heappop(priority_queue)
        if cur_node == TARGET:
            break

        for neighbor in node_lookup[cur_node]['neighbors']:
            neighbor_name = neighbor['code']
            tentative_g_score = g_scores[cur_node] + neighbor['distance']
            if tentative_g_score < g_scores[neighbor_name]:
                g_scores[neighbor_name] = tentative_g_score
                f_score = tentative_g_score + heuristic(neighbor_name)
                heapq.heappush(priority_queue, (f_score, neighbor_name))
                Path[neighbor_name] = cur_node

    path = reconstruct_path(Path, START, TARGET)
    total_distance = g_scores[TARGET]

    return create_result(path, total_distance, node_lookup, START, TARGET)


def create_result(path, total_distance, node_lookup, START, TARGET):
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
