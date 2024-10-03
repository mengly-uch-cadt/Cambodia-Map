import os
import pandas as pd
from pprint import pprint
from utils.algorithm import (bfs_search, dfs_search, gbfs_search, astar_search)


this_path = os.path.dirname(os.path.realpath(__file__))
filepath = os.path.join(this_path, 'data/Map/graph.json')



def randomly_select():
    df = pd.read_json(filepath)
    # print('Shape:',df.shape)
    dfs = df.sample(2)
    codes = dfs['code'].to_list()
    return {
        'START': codes[0],
        'TARGET': codes[1],
    }


def print_results(result):
    print(f"Total Distance: {result['distance']:.2f} km")
    print(f"Straight-Line : {result['straight']:.2f} km")
    print(f"Pass Nodes    : {len(result['points'])}")
    print("Path:", " -> ".join([x['code'] for x in result['points']]))


def main():
    sample = randomly_select()
    START_CODE = sample['START']
    TARGET_CODE = sample['TARGET']
    print('START :',START_CODE)
    print('TARGET:',TARGET_CODE)
    print()

    print("\n# BFS Search:")
    result = bfs_search(filepath, START_CODE, TARGET_CODE)
    print_results(result)

    print("\n# DFS Search:")
    result = dfs_search(filepath, START_CODE, TARGET_CODE)
    print_results(result)

    print("\n# GBFS Search:")
    result = gbfs_search(filepath, START_CODE, TARGET_CODE)
    print_results(result)

    print("\n# A* Search:")
    result = astar_search(filepath, START_CODE, TARGET_CODE)
    print_results(result)






if __name__ == '__main__':
    os.system('cls||clear')
    main()
