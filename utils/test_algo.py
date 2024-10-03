########################################################################################################
import json
import math

# Load the JSON data
with open('E:\\TUX\\MathAI\\CurrentMap\\graph.json', encoding='utf-8') as f:
    data = json.load(f)

########################################################################################################
# Haversine formula to calculate the distance between two points on Earth
def haversine(lon1, lat1, lon2, lat2):
    R = 6371.0  # Radius of the Earth in km
    dlon = math.radians(lon2 - lon1)
    dlat = math.radians(lat2 - lat1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    return distance
########################################################################################################
# BFS
def bfs(START, TARGET):
    node_lookup = {node['code']: node for node in data}
    Cur_node = START
    Open = []
    Close = []
    Path = {}
    total_distance = 0.0  # To accumulate the total distance

    try:
        while Cur_node != TARGET:
            if Cur_node not in node_lookup:
                raise KeyError(f"Node '{Cur_node}' not found in lookup.")

            node = node_lookup[Cur_node]
            neighbors = node['neighbors']
            for neighbor in neighbors:
                neighbor_name = neighbor['code']
                if neighbor_name not in Open and neighbor_name not in Close:
                    Open.append(neighbor_name)
                    Path[neighbor_name] = Cur_node  # Record the path

            if Cur_node not in Close:
                Close.append(Cur_node)
            if Open:  # Ensure there's an item to pop from Open
                Cur_node = Open.pop(0)
            else:
                raise KeyError(f"No path found from '{START}' to '{TARGET}'.")

        # Reconstruct the path from TARGET to START
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

        # Calculate the total distance along the path
        for i in range(len(path) - 1):
            start_node = node_lookup[path[i]]
            end_node = node_lookup[path[i + 1]]

            # Find the distance from the start_node to the corresponding neighbor
            for neighbor in start_node['neighbors']:
                if neighbor['code'] == end_node['code']:
                    total_distance += neighbor['distance_from_commune']
                    break

        # Calculate the straight-line distance between START and TARGET
        start_node = node_lookup[START]
        target_node = node_lookup[TARGET]
        straight_line_distance = haversine(
            start_node['Longitude'], start_node['Latitude'],
            target_node['Longitude'], target_node['Latitude']
        )

        return {
            "path": path,
            "distance": round(total_distance,2),
            "straight": round(straight_line_distance,2)
        }

    except KeyError as e:
        return "Path not found"

# START = 'KH010201'
# TARGET = 'KH140403'
# path_info = bfs(START, TARGET)

# # Print path and distances
# if path_info != "Path not found":
#     print("Path:", " -> ".join(path_info['path']))
#     print("Total Distance:", path_info['distance'], "km")
#     print("Straight-Line Distance:", path_info['straight'], "km")
# else:
#     print(path_info)
########################################################################################################
# DFS
def create_graph(data):
    graph = {}
    for entry in data:
        code = entry["code"]
        neighbors = {neighbor['code']: neighbor['distance_from_commune'] for neighbor in entry["neighbors"]}
        graph[code] = neighbors
    return graph
GRAPH = create_graph(data)
def final_path(start_code, path, graph, data):
    result_path = []
    total_distance = 0.0
    current = start_code

    while current is not None:
        result_path.insert(0, current)
        parent = path.get(current)

        if parent is not None:
            total_distance += graph[parent][current]  # Add the distance from parent to current

        current = parent

    # Calculate the straight-line distance
    start_node = next((item for item in data if item["code"] == result_path[0]), None)
    target_node = next((item for item in data if item["code"] == result_path[-1]), None)

    if start_node and target_node:
        straight_line_distance = haversine(
            start_node['Longitude'], start_node['Latitude'],
            target_node['Longitude'], target_node['Latitude']
        )
    else:
        straight_line_distance = None

    return result_path, total_distance, straight_line_distance

# DFS search function by code
def dfs_search_by_code(start_code, target_code):
    graph = GRAPH
    stack = [(start_code, None)]  # Stack holds (current_node, parent_node)
    visited = set()
    path = {}  # Dictionary to store the path

    while stack:
        current, parent = stack.pop()
        if current in visited:
            continue

        visited.add(current)
        path[current] = parent

        if current == target_code:
            return final_path(current, path, graph, data)

        for neighbor in reversed(graph.get(current, {}).keys()):  # Reverse to maintain order
            if neighbor not in visited:
                stack.append((neighbor, current))

    return "Path not found"

# # Example Usage by Code
# START_CODE = 'KH010201'
# TARGET_CODE = 'KH010202'

# result = dfs_search_by_code(START_CODE, TARGET_CODE)

# if isinstance(result, tuple):
#     result_path, total_distance, straight_line_distance = result
#     print("lenght:", result_path)
#     print("Path:", " -> ".join(result_path))
#     print(f"Total distance: {total_distance:.2f} km")
#     print(f"Straight-line distance: {straight_line_distance:.2f} km")
# else:
#     print(result)
